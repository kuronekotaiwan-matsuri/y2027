import Link from 'next/link';
import Button from '@/components/common/Button/Button';
import EventInfo from '@/components/home/EventInfo/EventInfo';
import { site, type Phase } from '@/config/site';
import { monthLabel } from '@/lib/content/select';
import type { RecordSummary, StorySummary } from '@/lib/content/types';
import { getHeroPlan } from '@/lib/phase';
import styles from './Hero.module.css';

interface HeroProps {
  phase: Phase;
  /** 最新の記録（making のときの「いま」） */
  latest?: { record: RecordSummary; story: StorySummary };
}

/** トップのヒーロー。phase で主に置くものと CTA が変わる（仕様書 5.1） */
export default function Hero({ phase, latest }: HeroProps) {
  const { event } = site;
  const plan = getHeroPlan(phase, {
    making: '/making/',
    shops: '/shops/',
    programs: '/programs/',
    instagram: site.instagram,
  });

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.heroInner}>
        <p className={styles.heroEyebrow}>
          第{event.edition}回 ／ {event.scheduleLabel}
        </p>
        <h1 id="hero-title" className={styles.heroTitle}>
          {site.name}
        </h1>
        <p className={styles.heroCatch}>{site.catchphrase}</p>

        {plan.showNow &&
          (latest ? (
            <Link href={`/making/records/${latest.record.slug}/`} className={styles.heroNow}>
              <span className={styles.heroNowLabel}>いま</span>
              <span className={styles.heroNowMonth}>{monthLabel(latest.record.date)}</span>
              <span className={styles.heroNowTitle}>{latest.record.title}</span>
            </Link>
          ) : (
            <div className={styles.heroNow}>
              <span className={styles.heroNowLabel}>いま</span>
              <span className={styles.heroNowTitle}>準備を始めたところです</span>
            </div>
          ))}
        {plan.showNow && (
          <p className={styles.heroEvent}>
            {event.scheduleLabel}（{event.scheduleNote}）。決まったら、ここに書きます。
          </p>
        )}

        {plan.showEventInfo && (
          <div className={styles.heroEventInfo}>
            <EventInfo items={event.items} />
          </div>
        )}

        {plan.showHeld && (
          <p className={styles.heroHeld}>{event.heldLabel ?? event.scheduleLabel}</p>
        )}

        <div className={styles.heroCta}>
          {plan.ctas.map((cta) => (
            <Button key={cta.href} href={cta.href} variant={cta.variant} external={cta.external}>
              {cta.label}
            </Button>
          ))}
        </div>

        {plan.showMakingLink && (
          <p className={styles.heroMakingLink}>
            <Link href="/making/">できるまでを見る</Link>
          </p>
        )}
      </div>
    </section>
  );
}
