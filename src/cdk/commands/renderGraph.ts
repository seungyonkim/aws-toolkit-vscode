/*!
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { getLogger } from '../../shared/logger'
import * as telemetry from '../../shared/telemetry/telemetry'
import { localize } from '../../shared/utilities/vsCodeUtils'
import { Commands } from '../../shared/vscode/commands'
import { Window } from '../../shared/vscode/window'
import { ConstructNode } from '../explorer/nodes/constructNode'
import { showErrorWithLogs } from '../../shared/utilities/messages'
import { AslVisualizationCDK } from './aslVisualizationCDK'
import { getCfnDefinitionForStateMachine } from '../explorer/nodes/getCfnDefinition'

/**
 * Renders a state graph of the state machine represented by the given node.
 *
 */
export async function renderGraphCommand(
    node: ConstructNode,
    window = Window.vscode(),
    commands = Commands.vscode()
    ): Promise<AslVisualizationCDK | undefined> {
    getLogger().debug('Render graph called for: %O', node)

    const uniqueIdentifier = node.label
    var cdkOutPath = node.id?.replace(`/tree.json/${node.tooltip}`, ``)!
    var stackName = node.tooltip?.replace(`/${node.label}`, ``)!

    getLogger().info(`Rendering graph: ${uniqueIdentifier}`)
    try {
        const cfnDefinition = getCfnDefinitionForStateMachine(uniqueIdentifier, cdkOutPath, stackName)

        const newVisualization = new AslVisualizationCDK(cfnDefinition ? cfnDefinition : 'error', uniqueIdentifier)

        getLogger().info('Rendered graph: %O', uniqueIdentifier)
        window.showInformationMessage(localize('AWS.cdk.renderGraph.success', 'Rendered graph {0}', uniqueIdentifier))
        telemetry.recordS3CreateBucket({ result: 'Succeeded' })
        return newVisualization
    } catch (e) {
        getLogger().error(`Failed to create bucket ${uniqueIdentifier}: %O`, e)
        showErrorWithLogs(
            localize('AWS.cdk.renderGraph.error.general', 'Failed to render graph {0}', uniqueIdentifier),
            window
        )
        //telemetry.recordS3CreateBucket({ result: 'Failed' })
    }
    //await refreshNode(node, commands)
}

// async function refreshNode(node: ConstructNode, commands: Commands): Promise<void> {
//     return commands.execute('aws.refreshAwsExplorerNode', node)
// }