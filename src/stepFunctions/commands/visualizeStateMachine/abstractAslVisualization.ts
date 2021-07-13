/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as nls from 'vscode-nls'
const localize = nls.loadMessageBundle()
import { debounce } from 'lodash'
import * as path from 'path'
import * as vscode from 'vscode'
import { ext } from '../../../shared/extensionGlobals'
import { getLogger, Logger } from '../../../shared/logger'
// import { isDocumentValid } from '../../utils'
// import * as yaml from 'yaml'

// import { YAML_ASL } from '../../constants/aslFormats'

// const YAML_OPTIONS: yaml.Options = {
//     merge: false,
//     maxAliasCount: 0,
//     schema: 'yaml-1.1',
//     version: '1.1',
//     prettyErrors: true,
// }

// export interface MessageObject {
//     command: string
//     text: string
//     error?: string
//     stateMachineData: string
// }

export abstract class AbstractAslVisualization {
    //public readonly documentUri: vscode.Uri
    public readonly webviewPanel: vscode.WebviewPanel 
    protected readonly disposables: vscode.Disposable[] = []
    protected isPanelDisposed = false
    //private readonly onVisualizationDisposeEmitter = new vscode.EventEmitter<void>()
    protected readonly onVisualizationDisposeEmitter = new vscode.EventEmitter<void>()

    //public constructor(textDocument: vscode.TextDocument) {
    public constructor(webviewInput:any) {
        //this.documentUri = textDocument.uri
        this.webviewPanel = this.setupWebviewPanel(webviewInput)
    }

    public get onVisualizationDisposeEvent(): vscode.Event<void> {
        return this.onVisualizationDisposeEmitter.event
    }

    public getPanel(): vscode.WebviewPanel | undefined {
        if (!this.isPanelDisposed) {
            return this.webviewPanel
        }
    }

    public getWebview(): vscode.Webview | undefined {
        if (!this.isPanelDisposed) {
            return this.webviewPanel?.webview
        }
    }

    public showPanel(): void {
        this.getPanel()?.reveal()
    }

    abstract sendUpdateMessage(message:any) :void

    protected  abstract setupWebviewPanel(webviewInput:any): vscode.WebviewPanel

    //private createVisualizationWebviewPanel(title:any): vscode.WebviewPanel {
    protected createVisualizationWebviewPanel(title:any): vscode.WebviewPanel {
        return vscode.window.createWebviewPanel(
            'stateMachineVisualization',
            this.makeWebviewTitle(title),
            {
                preserveFocus: true,
                viewColumn: vscode.ViewColumn.Beside,
            },
            {
                enableScripts: true,
                localResourceRoots: [
                    ext.visualizationResourcePaths.localWebviewScriptsPath,
                    ext.visualizationResourcePaths.visualizationLibraryCachePath,
                    ext.visualizationResourcePaths.stateMachineCustomThemePath,
                ],
                retainContextWhenHidden: true,
            }
        )
    }

    // private makeWebviewTitle(sourceDocumentUri: vscode.Uri): string {
    //     return localize('AWS.stepFunctions.graph.titlePrefix', 'Graph: {0}', path.basename(sourceDocumentUri.fsPath))
    // }
    protected abstract makeWebviewTitle(title:any): string 

    //private getWebviewContent(
    protected getWebviewContent(
        webviewBodyScript: vscode.Uri,
        graphStateMachineLibrary: vscode.Uri,
        vsCodeCustomStyling: vscode.Uri,
        graphStateMachineDefaultStyles: vscode.Uri,
        cspSource: string,
        statusTexts: {
            syncing: string
            notInSync: string
            inSync: string
        }
    ): string {
        return `
    <!DOCTYPE html>
    <html>
        <head>
            <meta http-equiv="Content-Security-Policy"
            content="default-src 'none';
            img-src ${cspSource} https: data:;
            script-src ${cspSource} 'self' 'unsafe-eval';
            style-src ${cspSource};"
            >
            <meta charset="UTF-8">
            <link rel="stylesheet" href='${graphStateMachineDefaultStyles}'>
            <link rel="stylesheet" href='${vsCodeCustomStyling}'>
            <script src='${graphStateMachineLibrary}'></script>
        </head>

        <body>
            <div id="svgcontainer" class="workflowgraph">
                <svg></svg>
            </div>
            <div id = "forCDK" class="status-info">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="42" stroke-width="4" />
                </svg>
                <div id="cdk-status-messages" class="status-messages">
                    <span class="previewing-asl-message">${statusTexts.inSync}</span>
                    <span class="rendering-asl-message">${statusTexts.syncing}</span>
                    <span class="error-asl-message">${statusTexts.notInSync}</span>
                </div>
            </div>
            <div class="graph-buttons-container">
                <button id="zoomin">
                    <svg focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                        <line x1="8" y1="1" x2="8" y2="15"></line>
                        <line x1="15" y1="8" x2="1" y2="8"></line>
                    </svg>
                </button>
                <button id="zoomout">
                    <svg focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                        <line x1="15" y1="8" x2="1" y2="8"></line>
                    </svg>
                </button>
                <button id="center">
                    <svg focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                        <circle cx="8" cy="8" r="7" stroke-width="2" />
                        <circle cx="8" cy="8" r="1" stroke-width="2" />
                    </svg>
                </button>
            </div>

            <script src='${webviewBodyScript}'></script>
        </body>
    </html>`
    }

    // private trackedDocumentDoesExist(trackedDocumentURI: vscode.Uri): boolean {
    //     const document = vscode.workspace.textDocuments.find(doc => doc.fileName === trackedDocumentURI.fsPath)

    //     return document !== undefined
    // }
}