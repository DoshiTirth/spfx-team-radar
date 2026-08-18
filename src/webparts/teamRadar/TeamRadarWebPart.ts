import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneSlider
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { SPHttpClient } from '@microsoft/sp-http';

import * as strings from 'TeamRadarWebPartStrings';
import TeamRadar from './components/TeamRadar';
import { ITeamRadarProps } from './components/ITeamRadarProps';
import { ITeamRadarWebPartProps } from './ITeamRadarWebPartProps';

export default class TeamRadarWebPart extends BaseClientSideWebPart<ITeamRadarWebPartProps> {

  public render(): void {
    const element: React.ReactElement<ITeamRadarProps> = React.createElement(
      TeamRadar,
      {
        radarTitle: this.properties.radarTitle,
        listName: this.properties.listName,
        weeksToShow: this.properties.weeksToShow || 8,
        siteUrl: this.context.pageContext.web.absoluteUrl,
        spHttpClient: this.context.spHttpClient as unknown as SPHttpClient,
        currentUser: {
          displayName: this.context.pageContext.user.displayName,
          loginName: this.context.pageContext.user.loginName
        }
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: strings.PropertyPaneDescription },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('radarTitle', { label: strings.RadarTitleFieldLabel }),
                PropertyPaneTextField('listName', {
                  label: strings.ListNameFieldLabel,
                  description: strings.ListNameFieldDescription
                }),
                PropertyPaneSlider('weeksToShow', {
                  label: strings.WeeksToShowFieldLabel,
                  min: 4,
                  max: 12,
                  step: 1
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
