/*!
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { _Blob } from 'aws-sdk/clients/lambda'
import _ = require('lodash')
import * as vscode from 'vscode'
import { ext } from '../../shared/extensionGlobals'
import { ExtensionUtilities } from '../../shared/extensionUtilities'
import { BaseTemplates } from '../../shared/templates/baseTemplates'
import { localize } from '../../shared/utilities/vsCodeUtils'
import { FeedbackTemplates } from '../templates/feedbackTemplates'
import { submitFeedbackListener } from './submitFeedbackListener'

export function submitFeedback(listener?: (message: any) => Promise<void>): vscode.WebviewPanel {
    const panel = vscode.window.createWebviewPanel(
        'html',
        localize('AWS.submitFeedback.title', 'Send Feedback'),
        vscode.ViewColumn.One,
        {
            retainContextWhenHidden: true,
            enableScripts: true,
        }
    )
    const baseTemplateFn = _.template(BaseTemplates.SIMPLE_HTML)

    panel.webview.html = baseTemplateFn({
        cspSource: panel.webview.cspSource,
        content: '<h1>Loading...</h1>',
    })

    const feedbackTemplateFn = _.template(FeedbackTemplates.SUBMIT_TEMPLATE)

    const loadScripts = ExtensionUtilities.getScriptsForHtml(['submitFeedbackVue.js'], panel.webview)
    const loadLibs = ExtensionUtilities.getLibrariesForHtml(['vue.min.js'], panel.webview)
    const loadStylesheets = ExtensionUtilities.getCssForHtml(['submitFeedback.css'], panel.webview)

    panel.webview.html = baseTemplateFn({
        cspSource: panel.webview.cspSource,
        content: feedbackTemplateFn({
            Scripts: loadScripts,
            Libraries: loadLibs,
            Stylesheets: loadStylesheets,
        }),
    })

    const feedbackListener = listener === undefined ? createListener(panel) : listener
    panel.webview.onDidReceiveMessage(feedbackListener, undefined, ext.context.subscriptions)

    return panel
}

function createListener(panel: vscode.WebviewPanel) {
    const feedbackPanel = {
        postMessage: (message: any) => panel.webview.postMessage(message),
        dispose: () => panel.dispose(),
    }

    const window = {
        showInformationMessage: (message: string) => vscode.window.showInformationMessage(message),
    }

    return submitFeedbackListener(feedbackPanel, window, ext.telemetry)
}
