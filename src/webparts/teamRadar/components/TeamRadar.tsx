import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  CommandBarButton,
  Spinner,
  SpinnerSize,
  MessageBar,
  MessageBarType
} from '@fluentui/react';

import styles from './TeamRadar.module.scss';
import { ITeamRadarProps, IPulseEntry, Workload, getWeekStart } from './ITeamRadarProps';
import { fetchPulses, upsertPulse } from './TeamRadarDataService';
import RadarGrid from './RadarGrid';
import PulseForm from './PulseForm';

const TeamRadar: React.FC<ITeamRadarProps> = (props) => {
  const { listName, radarTitle, weeksToShow } = props;

  const [entries, setEntries] = useState<IPulseEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [formOpen, setFormOpen] = useState<boolean>(false);

  const load = async (): Promise<void> => {
    if (!listName) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await fetchPulses(props.spHttpClient, props.siteUrl, listName);
      setEntries(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load team radar data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load().catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listName]);

  const currentWeekStart = useMemo(() => getWeekStart(new Date()), []);

  const weeks = useMemo(() => {
    const list: string[] = [];
    const cursor = new Date(currentWeekStart);
    for (let i = 0; i < weeksToShow; i++) {
      list.unshift(cursor.toISOString().slice(0, 10));
      cursor.setDate(cursor.getDate() - 7);
    }
    return list;
  }, [currentWeekStart, weeksToShow]);

  const myExistingEntry = useMemo(
    () =>
      entries.find(
        (e) => e.PersonName === props.currentUser.displayName && e.WeekStartDate === currentWeekStart
      ),
    [entries, props.currentUser.displayName, currentWeekStart]
  );

  const weekLabel = new Date(currentWeekStart).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  });

  const handleSubmit = async (workload: Workload, mood: number, blocker: string): Promise<void> => {
    await upsertPulse(props.spHttpClient, props.siteUrl, listName, myExistingEntry, {
      PersonName: props.currentUser.displayName,
      WeekStartDate: currentWeekStart,
      Workload: workload,
      Mood: mood,
      Blocker: blocker
    });
    await load();
  };

  const stretchedCount = useMemo(
    () => entries.filter((e) => e.WeekStartDate === currentWeekStart && e.Workload === 'Stretched').length,
    [entries, currentWeekStart]
  );

  const openBlockers = useMemo(
    () => entries.filter((e) => e.WeekStartDate === currentWeekStart && e.Blocker).length,
    [entries, currentWeekStart]
  );

  if (!listName) {
    return (
      <div className={styles.teamRadar}>
        <MessageBar messageBarType={MessageBarType.info}>
          Set a SharePoint list name in the web part's edit pane to get started.
        </MessageBar>
      </div>
    );
  }

  return (
    <div className={styles.teamRadar}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>{radarTitle || 'Team Radar'}</h2>
          {!loading && (
            <div className={styles.subtitle}>
              {stretchedCount > 0 && <span className={styles.flag}>{stretchedCount} stretched this week</span>}
              {openBlockers > 0 && <span className={styles.flag}>{openBlockers} open blocker{openBlockers > 1 ? 's' : ''}</span>}
            </div>
          )}
        </div>
        <CommandBarButton
          iconProps={{ iconName: 'Ringer' }}
          text={myExistingEntry ? 'Update your pulse' : 'Submit your pulse'}
          onClick={() => setFormOpen(true)}
          className={styles.pulseButton}
        />
      </div>

      {error && <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>}

      {loading ? (
        <Spinner size={SpinnerSize.large} label="Loading team radar…" />
      ) : (
        <RadarGrid entries={entries} weeks={weeks} />
      )}

      <PulseForm
        isOpen={formOpen}
        onDismiss={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        weekLabel={weekLabel}
        initialWorkload={myExistingEntry?.Workload}
        initialMood={myExistingEntry?.Mood}
        initialBlocker={myExistingEntry?.Blocker}
      />
    </div>
  );
};

export default TeamRadar;
