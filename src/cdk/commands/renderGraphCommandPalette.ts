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

export async function previewCDKStateMachineFromTemplate(context: vscode.ExtensionContext) {
    const logger: Logger = getLogger()

    const wizardResponse = await new PreviewStateMachineCDKWizard().run()

    if (wizardResponse && wizardResponse.cdkApplication && wizardResponse.stateMachine) {
        try {
            logger.debug(
                //change this part!!!!!!!!!!!!!!!!!!!!!!!!!!
                `User selected the ${wizardResponse.cdkApplication.label} template of ${wizardResponse.stateMachine} format`
            )

            // const textDocumentFromSelection = await getTextDocumentForSelectedItem(
            //     wizardResponse.cdkApplication,
            //     context.extensionPath,
            //     wizardResponse.stateMachine.
            // )

            //vscode.window.showTextDocument(textDocumentFromSelection)
        } catch (err) {
            logger.error(err as Error)
            vscode.window.showErrorMessage(
                localize(
                    'AWS.message.error.stepfunctions.getTextDocumentForSelectedItem',
                    'There was an error creating the State Machine Template, check log for details.'
                )
            )
        }
    }
}

// async function getTextDocumentForSelectedItem(
//     item: StateMachineListPickItem,
//     extensionPath: string,
//     format: string
// ): Promise<vscode.TextDocument> {
//     let content = await readFileAsString(path.join(extensionPath, 'templates', item.fileName))

//     const options = {
//         content,
//         language: format === JSON_ASL,
//     }

//     return await vscode.workspace.openTextDocument(options)
// }
