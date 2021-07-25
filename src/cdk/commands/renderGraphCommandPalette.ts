/*!
 * Copyright 2018-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as nls from 'vscode-nls'
const localize = nls.loadMessageBundle()
import { dump, load } from 'js-yaml'

import * as path from 'path'
import * as vscode from 'vscode'
import { readFileAsString } from '../../shared/filesystemUtilities'
import { getLogger, Logger } from '../../shared/logger'
import PreviewStateMachineCDKWizard from '../wizards/previewStateMachineCDKWizard'
import { showErrorWithLogs } from '../../../src/shared/utilities/messages'
import { renderGraphCommand } from './renderGraph'
import { AslVisualizationCDKManager } from './aslVisualizationCDKManager'

export async function previewCDKStateMachineFromTemplate(context: vscode.Memento, aslVisualizationCDKManager: AslVisualizationCDKManager) {
    const logger: Logger = getLogger()

    const wizardResponse = await new PreviewStateMachineCDKWizard().run()

    if (wizardResponse && wizardResponse.cdkApplication && wizardResponse.stateMachine) {
            logger.debug(
                `User selected the ${wizardResponse.stateMachine} state machine of ${wizardResponse.cdkApplication.label} CDK application`
            )
            
            //this error will get resolved when merged with render-graph-from-cdk branch 
            renderGraphCommand(wizardResponse.stateMachine.stateMachineNode,context,aslVisualizationCDKManager)
            
    }
}
