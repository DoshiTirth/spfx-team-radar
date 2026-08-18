declare interface ITeamRadarWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  RadarTitleFieldLabel: string;
  ListNameFieldLabel: string;
  ListNameFieldDescription: string;
  WeeksToShowFieldLabel: string;
}

declare module 'TeamRadarWebPartStrings' {
  const strings: ITeamRadarWebPartStrings;
  export = strings;
}
