import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { IPulseEntry } from './ITeamRadarProps';

const PAGE_SIZE = 500;

export async function fetchPulses(
  spHttpClient: SPHttpClient,
  siteUrl: string,
  listName: string
): Promise<IPulseEntry[]> {
  const encodedList = encodeURIComponent(listName.replace(/'/g, "''"));
  let url =
    `${siteUrl}/_api/web/lists/getbytitle('${encodedList}')/items` +
    `?$select=Id,PersonName,WeekStartDate,Workload,Mood,Blocker` +
    `&$orderby=WeekStartDate desc&$top=${PAGE_SIZE}`;

  const items: IPulseEntry[] = [];

  while (url) {
    const response: SPHttpClientResponse = await spHttpClient.get(url, SPHttpClient.configurations.v1);
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`SharePoint REST call failed (${response.status}): ${body}`);
    }
    const json = await response.json();
    items.push(...(json.value as IPulseEntry[]));
    url = json['odata.nextLink'] || json['@odata.nextLink'] || '';
  }

  return items;
}

async function getDigest(spHttpClient: SPHttpClient, siteUrl: string): Promise<string> {
  const response = await spHttpClient.get(
    `${siteUrl}/_api/contextinfo`,
    SPHttpClient.configurations.v1,
    { method: 'POST' }
  );
  const json = await response.json();
  return json.FormDigestValue;
}

/**
 * Creates this week's pulse entry, or updates it in place if the current user
 * already submitted one for the same week (so people can revise their answer).
 */
export async function upsertPulse(
  spHttpClient: SPHttpClient,
  siteUrl: string,
  listName: string,
  existing: IPulseEntry | undefined,
  payload: { PersonName: string; WeekStartDate: string; Workload: string; Mood: number; Blocker: string }
): Promise<void> {
  const encodedList = encodeURIComponent(listName.replace(/'/g, "''"));
  const digest = await getDigest(spHttpClient, siteUrl);

  if (existing) {
    const response = await spHttpClient.post(
      `${siteUrl}/_api/web/lists/getbytitle('${encodedList}')/items(${existing.Id})`,
      SPHttpClient.configurations.v1,
      {
        headers: {
          Accept: 'application/json;odata=nometadata',
          'Content-Type': 'application/json;odata=nometadata',
          'X-RequestDigest': digest,
          'X-HTTP-Method': 'MERGE',
          'IF-MATCH': '*'
        },
        body: JSON.stringify(payload)
      }
    );
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Failed to update pulse (${response.status}): ${body}`);
    }
    return;
  }

  const response = await spHttpClient.post(
    `${siteUrl}/_api/web/lists/getbytitle('${encodedList}')/items`,
    SPHttpClient.configurations.v1,
    {
      headers: {
        Accept: 'application/json;odata=nometadata',
        'Content-Type': 'application/json;odata=nometadata',
        'X-RequestDigest': digest
      },
      body: JSON.stringify({ Title: `${payload.PersonName} - ${payload.WeekStartDate}`, ...payload })
    }
  );
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to post pulse (${response.status}): ${body}`);
  }
}
