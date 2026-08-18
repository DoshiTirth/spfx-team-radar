import * as React from 'react';
import { useState } from 'react';
import { Callout, DirectionalHint } from '@fluentui/react';
import styles from './TeamRadar.module.scss';
import { IPulseEntry, getCellColor } from './ITeamRadarProps';

export interface IRadarGridProps {
  entries: IPulseEntry[];
  weeks: string[];
}

const RadarGrid: React.FC<IRadarGridProps> = ({ entries, weeks }) => {
  const [hoverTarget, setHoverTarget] = useState<HTMLElement | null>(null);
  const [hoverEntry, setHoverEntry] = useState<IPulseEntry | null>(null);

  const people = Array.from(new Set(entries.map((e) => e.PersonName))).sort();

  const findEntry = (person: string, week: string): IPulseEntry | undefined =>
    entries.find((e) => e.PersonName === person && e.WeekStartDate === week);

  const formatWeek = (iso: string): string => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  if (people.length === 0) {
    return <div className={styles.empty}>No pulses submitted yet.</div>;
  }

  return (
    <div className={styles.gridWrap}>
      <table className={styles.grid}>
        <thead>
          <tr>
            <th className={styles.personHeader}></th>
            {weeks.map((w) => (
              <th key={w} className={styles.weekHeader}>{formatWeek(w)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {people.map((person) => (
            <tr key={person}>
              <td className={styles.personCell}>{person}</td>
              {weeks.map((w) => {
                const entry = findEntry(person, w);
                return (
                  <td key={w} className={styles.cellWrap}>
                    {entry ? (
                      <div
                        className={styles.cell}
                        style={{ background: getCellColor(entry.Workload, entry.Mood) }}
                        onMouseEnter={(e) => {
                          setHoverTarget(e.currentTarget);
                          setHoverEntry(entry);
                        }}
                        onMouseLeave={() => {
                          setHoverTarget(null);
                          setHoverEntry(null);
                        }}
                      >
                        {entry.Blocker && <span className={styles.blockerDot} />}
                      </div>
                    ) : (
                      <div className={styles.cellEmpty} />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {hoverTarget && hoverEntry && (
        <Callout
          target={hoverTarget}
          directionalHint={DirectionalHint.topCenter}
          onDismiss={() => setHoverTarget(null)}
          isBeakVisible
        >
          <div className={styles.tooltip}>
            <div className={styles.tooltipTitle}>{hoverEntry.PersonName}</div>
            <div>Workload: {hoverEntry.Workload}</div>
            <div>Mood: {hoverEntry.Mood}/5</div>
            {hoverEntry.Blocker && <div className={styles.tooltipBlocker}>Blocker: {hoverEntry.Blocker}</div>}
          </div>
        </Callout>
      )}

      <div className={styles.legend}>
        <span className={styles.legendItem}><span className={styles.legendSwatch} style={{ background: '#12b886' }} /> Light</span>
        <span className={styles.legendItem}><span className={styles.legendSwatch} style={{ background: '#2f6fed' }} /> Balanced</span>
        <span className={styles.legendItem}><span className={styles.legendSwatch} style={{ background: '#e64980' }} /> Stretched</span>
        <span className={styles.legendItem}><span className={styles.blockerDotStatic} /> Has blocker</span>
      </div>
    </div>
  );
};

export default RadarGrid;
