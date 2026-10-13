# /// script
# requires-python = ">=3.10"
# dependencies = [
#   "mcp>=1.24,<2",
#   "google-auth>=2.40,<3",
#   "requests>=2.32",
# ]
# ///
"""Google Search Console を読む MCP サーバー（読み取り専用）。

認証は analytics-mcp と同じ ADC ファイル（環境変数 GOOGLE_APPLICATION_CREDENTIALS）を使う。
サービスアカウントの権限借用ファイルのときは、Search Console 用のスコープでトークンを取り直す。
仕組みと設定は docs/analytics-mcp.md を参照。
"""

import datetime as dt
import json
import os
import re
import urllib.parse
from typing import Any

import google.auth
from google.auth import impersonated_credentials
from google.auth.transport.requests import AuthorizedSession
from mcp.server.fastmcp import FastMCP

SCOPE = "https://www.googleapis.com/auth/webmasters.readonly"
DEFAULT_SITE_URL = os.environ.get(
    "GSC_SITE_URL", "https://kuronekotaiwan-matsuri.github.io/y2027/"
)
WEBMASTERS = "https://www.googleapis.com/webmasters/v3"
INSPECTION = "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect"

mcp = FastMCP("search-console-mcp")
_session: AuthorizedSession | None = None


def _load_credentials():
    path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
    if path and os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            info = json.load(f)
        if info.get("type") == "impersonated_service_account":
            # google.auth.default() はファイルに書かれたスコープを優先するので、
            # Search Console 用のスコープを明示して権限借用の資格情報を組み立てる
            return impersonated_credentials.Credentials.from_impersonated_service_account_info(
                info, scopes=[SCOPE]
            )
    creds, _ = google.auth.default(scopes=[SCOPE])
    return creds


def _get_session() -> AuthorizedSession:
    global _session
    if _session is None:
        _session = AuthorizedSession(_load_credentials())
    return _session


def _site(site_url: str | None) -> str:
    return site_url or DEFAULT_SITE_URL


def _site_path(site_url: str | None) -> str:
    return f"{WEBMASTERS}/sites/{urllib.parse.quote(_site(site_url), safe='')}"


_RELATIVE = re.compile(r"^(\d+)daysAgo$")


def _resolve_date(value: str) -> str:
    """YYYY-MM-DD のほか today / yesterday / NdaysAgo を受け付ける。"""
    today = dt.date.today()
    if value == "today":
        return today.isoformat()
    if value == "yesterday":
        return (today - dt.timedelta(days=1)).isoformat()
    m = _RELATIVE.match(value)
    if m:
        return (today - dt.timedelta(days=int(m.group(1)))).isoformat()
    dt.date.fromisoformat(value)  # 形式の検証だけ行う
    return value


def _call(method: str, url: str, **kwargs: Any) -> dict[str, Any]:
    response = _get_session().request(method, url, timeout=60, **kwargs)
    try:
        body = response.json()
    except ValueError:
        body = {"raw": response.text}
    if not response.ok:
        raise RuntimeError(
            f"Search Console API error {response.status_code}: "
            f"{json.dumps(body, ensure_ascii=False)}"
        )
    return body


@mcp.tool()
def list_sites() -> dict[str, Any]:
    """Search Console でこの認証が読めるプロパティ（siteUrl と権限）の一覧を返す。"""
    return _call("GET", f"{WEBMASTERS}/sites")


@mcp.tool()
def query_search_analytics(
    start_date: str,
    end_date: str,
    dimensions: list[str] | None = None,
    row_limit: int = 25,
    start_row: int = 0,
    search_type: str = "web",
    dimension_filter_groups: list[dict[str, Any]] | None = None,
    site_url: str | None = None,
) -> dict[str, Any]:
    """検索パフォーマンス（クリック数、表示回数、CTR、平均掲載順位）を集計する。

    日付は YYYY-MM-DD か today / yesterday / NdaysAgo。データは2〜3日遅れて確定する。
    dimensions は query, page, country, device, date, searchAppearance から選ぶ（既定は query）。
    dimension_filter_groups は API の形式そのまま。例:
    [{"filters": [{"dimension": "page", "operator": "contains", "expression": "/making/"}]}]
    """
    body: dict[str, Any] = {
        "startDate": _resolve_date(start_date),
        "endDate": _resolve_date(end_date),
        "dimensions": dimensions or ["query"],
        "rowLimit": max(1, min(row_limit, 25000)),
        "startRow": max(0, start_row),
        "type": search_type,
    }
    if dimension_filter_groups:
        body["dimensionFilterGroups"] = dimension_filter_groups
    return _call("POST", f"{_site_path(site_url)}/searchAnalytics/query", json=body)


@mcp.tool()
def list_sitemaps(site_url: str | None = None) -> dict[str, Any]:
    """送信済みサイトマップと、その処理状況・エラー数・検出した URL 数を返す。"""
    return _call("GET", f"{_site_path(site_url)}/sitemaps")


@mcp.tool()
def inspect_url(url: str, site_url: str | None = None) -> dict[str, Any]:
    """URL 検査。Google のインデックス状況、最終クロール日時、canonical、モバイル・リッチリザルトの判定を返す。

    呼び出し上限が小さい（プロパティごとに 2,000 回/日、600 回/分）ので、全ページを一度に叩かない。
    """
    return _call(
        "POST",
        INSPECTION,
        json={"inspectionUrl": url, "siteUrl": _site(site_url), "languageCode": "ja"},
    )


if __name__ == "__main__":
    mcp.run()
