import * as React from 'react';
import { useState } from 'react';
import {
  Panel,
  PanelType,
  PrimaryButton,
  DefaultButton,
  TextField,
  ChoiceGroup,
  IChoiceGroupOption,
  Slider,
  MessageBar,
  MessageBarType
} from '@fluentui/react';
import styles from './TeamRadar.module.scss';
import { Workload, WORKLOAD_OPTIONS } from './ITeamRadarProps';

export interface IPulseFormProps {
  isOpen: boolean;
  onDismiss: () => void;
  onSubmit: (workload: Workload, mood: number, blocker: string) => Promise<void>;
  weekLabel: string;
  initialWorkload?: Workload;
  initialMood?: number;
  initialBlocker?: string;
}

const workloadOptions: IChoiceGroupOption[] = WORKLOAD_OPTIONS.map((w) => ({ key: w, text: w }));

const PulseForm: React.FC<IPulseFormProps> = ({
  isOpen,
  onDismiss,
  onSubmit,
  weekLabel,
  initialWorkload,
  initialMood,
  initialBlocker
}) => {
  const [workload, setWorkload] = useState<Workload>(initialWorkload || 'Balanced');
  const [mood, setMood] = useState<number>(initialMood ?? 3);
  const [blocker, setBlocker] = useState<string>(initialBlocker || '');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (): Promise<void> => {
    setSubmitting(true);
    setError('');
    try {
      await onSubmit(workload, mood, blocker.trim());
      onDismiss();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit pulse.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Panel
      isOpen={isOpen}
      onDismiss={onDismiss}
      type={PanelType.smallFixedFar}
      headerText={`Your pulse — week of ${weekLabel}`}
      closeButtonAriaLabel="Close"
    >
      <div className={styles.formBody}>
        {error && <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>}

        <ChoiceGroup
          label="Workload this week"
          selectedKey={workload}
          options={workloadOptions}
          onChange={(_e, option) => setWorkload((option?.key as Workload) || 'Balanced')}
        />

        <div className={styles.formField}>
          <Slider
            label="Mood"
            min={1}
            max={5}
            step={1}
            value={mood}
            showValue
            onChange={(v) => setMood(v)}
          />
        </div>

        <div className={styles.formField}>
          <TextField
            label="Blocker (optional)"
            multiline
            rows={3}
            value={blocker}
            onChange={(_e, v) => setBlocker(v || '')}
            placeholder="Anything slowing you down this week?"
          />
        </div>

        <div className={styles.formActions}>
          <PrimaryButton text={submitting ? 'Saving…' : 'Submit'} onClick={handleSubmit} disabled={submitting} />
          <DefaultButton text="Cancel" onClick={onDismiss} disabled={submitting} />
        </div>
      </div>
    </Panel>
  );
};

export default PulseForm;
