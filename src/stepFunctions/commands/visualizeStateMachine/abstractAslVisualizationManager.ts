/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as vscode from 'vscode'
import { AslVisualization } from './aslVisualization'
import * as nls from 'vscode-nls'
const localize = nls.loadMessageBundle()
import { Logger } from '../../../shared/logger'

export abstract class AbstractAslVisualizationManager {
    protected readonly managedVisualizations: Map<string, AslVisualization> = new Map<string, AslVisualization>()
    private readonly extensionContext: vscode.ExtensionContext

    public constructor(extensionContext: vscode.ExtensionContext) {
        this.extensionContext = extensionContext
    }

    public getManagedVisualizations(): Map<string, AslVisualization> {
        return this.managedVisualizations
    }

    abstract visualizeStateMachine(
        globalStorage: vscode.Memento,
        input: any
    ): Promise<vscode.WebviewPanel | undefined>

    protected deleteVisualization(visualizationToDelete: any): void {
        this.managedVisualizations.delete(visualizationToDelete)
    }

    protected pushToExtensionContextSubscriptions(visualizationDisposable: any) {
        this.extensionContext.subscriptions.push(visualizationDisposable)
    }

    protected getExistingVisualization(visualization: any): AslVisualization | undefined {
        return this.managedVisualizations.get(visualization)
    }

    protected handleErr(err: any, logger: Logger) {
        vscode.window.showInformationMessage(
            localize(
                'AWS.stepfunctions.visualisation.errors.rendering',
                'There was an error rendering State Machine Graph, check logs for details.'
            )
        )

        logger.debug('Unable to setup webview panel.')
        logger.error(err as Error)
    }

}