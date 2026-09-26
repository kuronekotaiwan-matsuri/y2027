import type { Metadata } from 'next';
import Button from '@/components/common/Button/Button';
import EmptyNote from '@/components/common/EmptyNote/EmptyNote';
import Section, { SectionMore } from '@/components/common/Section/Section';
import SectionTitle from '@/components/common/SectionTitle/SectionTitle';
import PeopleList from '@/components/making/PeopleList/PeopleList';
import { site } from '@/config/site';
import { getPeople, toPersonSummary } from '@/lib/content';
import { buildMetadata } from '@/lib/metadata';
import styles from './page.module.css';

export const metadata: Metadata = buildMetadata({
  title: '黒猫台湾まつりとは',
  description:
    '川崎・二子新地の大山街道沿いで開かれてきた台湾カルチャーフェスティバル「黒猫台湾まつり」の説明。これまでの歩み、2027年の挑戦、作っている人たち、関わり方。',
  path: '/about/',
});

const pastSiteUrl = (year: number) => site.pastSites.find((past) => past.year === year)?.url;

/** 黒猫台湾まつりとは（仕様書 5.6） */
export default function AboutPage() {
  const people = getPeople().map(toPersonSummary);
  return (
    <div className={styles.aboutPage}>
      <Section aria-labelledby="about-title">
        <SectionTitle as="h1" id="about-title">
          黒猫台湾まつりとは
        </SectionTitle>
        <p className={styles.lead}>
          黒猫台湾まつりは、神奈川県川崎市高津区・二子新地の大山街道沿いで開かれてきた、地域発の台湾カルチャーフェスティバルです。
          台湾のフードや雑貨、ワークショップ、ステージを、商店街の通りを歩きながら楽しみます。
        </p>
        <ul className={styles.pillars}>
          <li>
            <h2>台湾文化</h2>
            <p>台湾の食、雑貨、工芸、音楽を通じて、日本と台湾の交流を深めます。</p>
          </li>
          <li>
            <h2>地域</h2>
            <p>
              大山街道・二子新地の商店街と一緒に作る、町おこしの祭りです。会場エリアには台湾に縁のある実店舗があります。
            </p>
          </li>
          <li>
            <h2>人の交流</h2>
            <p>
              世代や国籍を超えて人が集まる場をつくります。ワークショップやステージを通じて、お互いを知る機会にします。
            </p>
          </li>
        </ul>
      </Section>

      <Section alt aria-labelledby="history-title">
        <SectionTitle id="history-title">これまでの歩み</SectionTitle>
        <ol className={styles.history}>
          <li>
            <span className={styles.historyYear}>2023年</span>
            <span>第1回</span>
          </li>
          <li>
            <span className={styles.historyYear}>2024年</span>
            <span>第2回</span>
          </li>
          <li>
            <span className={styles.historyYear}>2025年</span>
            <span>
              第3回{' '}
              {pastSiteUrl(2025) && (
                <a href={pastSiteUrl(2025)} target="_blank" rel="noopener noreferrer">
                  2025年のサイト
                </a>
              )}
            </span>
          </li>
          <li>
            <span className={styles.historyYear}>2026年</span>
            <span>
              第4回。5月30日・31日に大山街道沿いで開催{' '}
              {pastSiteUrl(2026) && (
                <a href={pastSiteUrl(2026)} target="_blank" rel="noopener noreferrer">
                  2026年のサイト
                </a>
              )}
            </span>
          </li>
          <li>
            <span className={styles.historyYear}>{site.event.year}年</span>
            <span>
              第{site.event.edition}回。{site.event.scheduleLabel}（{site.event.scheduleNote}）
            </span>
          </li>
        </ol>
      </Section>

      <Section aria-labelledby="challenge-title">
        <SectionTitle id="challenge-title">2027年の挑戦</SectionTitle>
        <ul className={styles.pillars}>
          <li>
            <h3>過程を公開する</h3>
            <p>
              決まったことだけでなく、迷っていること、試したこと、うまくいかなかったことも「できるまで」に記録します。
            </p>
          </li>
          <li>
            <h3>若者に任せる</h3>
            <p>
              これまで主体的に参加してきた若いメンバーに大きな権限を渡し、自分たちの企画を作ってもらいます。
            </p>
          </li>
          <li>
            <h3>関わる人を増やす</h3>
            <p>
              実行委員会だけでなく、出店者、出演者、ボランティア、地域の人の声が並ぶサイトにします。
            </p>
          </li>
        </ul>
        <SectionMore>
          <Button href="/making/" variant="secondary">
            できるまでを見る
          </Button>
        </SectionMore>
      </Section>

      <Section alt aria-labelledby="people-title">
        <SectionTitle id="people-title">作っている人たち</SectionTitle>
        <p className={styles.text}>
          祭りを作っているのは{site.organizer}
          です。2027年は、実行委員だけでなく、出店者など、いろいろな立場の人が「できるまで」に記録を書いていきます。ここに並ぶのは、いま書いている人たちです。顔や名前を押すと、その人の記録をまとめて読めます。
        </p>
        {people.length > 0 ? (
          <PeopleList people={people} />
        ) : (
          <EmptyNote>
            書いている人は、まだ登録されていません。記録を書き始めたら、顔と名前がここに並びます。
          </EmptyNote>
        )}
      </Section>

      <Section aria-labelledby="join-title">
        <SectionTitle id="join-title">関わり方</SectionTitle>
        <p className={styles.text}>
          意見を言いたい、手伝いたい、出店や出演に興味がある。どんな形でも、まずは Instagram の DM
          かメールで声をかけてください。ボランティアの募集を始めたら、このページと記録でお知らせします。
        </p>
        <div className={styles.actions}>
          <Button href={site.instagram} external>
            Instagramを見る
          </Button>
          <a className={styles.email} href={`mailto:${site.email}`}>
            {site.email}
          </a>
        </div>
      </Section>
    </div>
  );
}
