/*!
 * Copyright 2018-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as nls from 'vscode-nls'
const localize = nls.loadMessageBundle()

import * as vscode from 'vscode'
import * as picker from '../../shared/ui/picker'

import {
    MultiStepWizard,
    WIZARD_GOBACK,
    WIZARD_TERMINATE,
    wizardContinue,
    WizardStep,
} from '../../shared/wizards/multiStepWizard'
import { CdkAppLocation } from '../explorer/cdkProject'
import { detectCdkProjects } from '../explorer/detectCdkProjects'
import { ConstructNode } from '../explorer/nodes/constructNode'
import { String } from 'aws-sdk/clients/cloudsearch'
import { map } from 'lodash'
import { AppNode } from '../explorer/nodes/appNode'

export interface CdkAppLocationPickItem {
    label: string,
    cdkApplocation: CdkAppLocation
}
export interface ConstructNodePickItem {
    label: string,
    //stateMachineNode: ConstructNode
    stateMachineNode: string
}
export const STARTER_TEMPLATES: ConstructNodePickItem[] = [
    {
        label: localize('AWS.stepfunctions.template.helloWorld.label', 'Hello world'),
        stateMachineNode: 'HelloWorld.asl.json',
    },
    {
        label: localize('AWS.stepfunctions.template.retryFailure.label', 'Retry failure'),
        stateMachineNode: 'RetryFailure.asl.json',
    },
    {
        label: localize('AWS.stepfunctions.template.waitState.label', 'Wait state'),
        stateMachineNode: 'WaitState.asl.json',
    },
]

interface PreviewStateMachineCDKWizardResponse {
    cdkApplication: CdkAppLocationPickItem
    stateMachine: ConstructNodePickItem
}

export default class PreviewStateMachineCDKWizard extends MultiStepWizard<PreviewStateMachineCDKWizardResponse> {
    private cdkApplication?: CdkAppLocationPickItem
    private stateMachine?: ConstructNodePickItem
    private promptUser: typeof picker.promptUser

    public constructor(promptUser?: typeof picker.promptUser) {
        super()

        this.promptUser = promptUser || picker.promptUser.bind(picker)
    }

    protected get startStep() {
        return this.CREATE_TEMPLATE_ACTION
    }

    private readonly CREATE_TEMPLATE_ACTION: WizardStep = async () => {
        const cdkAppLocations: CdkAppLocation[] = await detectCdkProjects(vscode.workspace.workspaceFolders)

        if (cdkAppLocations.length === 0) return wizardContinue(this.TEMPLATE_FORMAT_ACTION)
        //need to pick out only the applications containing a state machine 
        const CDK_APPLOCATIONS: CdkAppLocationPickItem[] = []
        cdkAppLocations.map(obj => {
            CDK_APPLOCATIONS.push(
                {
                    //need to change this part!!!!!!!!!!!!!!!!
                    //label: obj.cdkJsonPath,
                    label: obj.cdkJsonPath,
                    cdkApplocation: obj
                })
        })
        const quickPick = picker.createQuickPick<CdkAppLocationPickItem>({
            options: {
                ignoreFocusOut: true,
                title: localize(
                    'AWS.message.prompt.selectCDKApplication.placeholder',
                    'Select CDK Application'
                ),
                step: 1,
                totalSteps: 2,
            },
            buttons: [vscode.QuickInputButtons.Back],
            items: CDK_APPLOCATIONS,
        })

        const choices = await this.promptUser({
            picker: quickPick,
            onDidTriggerButton: (button, resolve) => {
                if (button === vscode.QuickInputButtons.Back) {
                    resolve(undefined)
                }
            },
        })

        this.cdkApplication = picker.verifySinglePickerOutput<CdkAppLocationPickItem>(choices)
        return this.cdkApplication ? wizardContinue(this.TEMPLATE_FORMAT_ACTION) : WIZARD_GOBACK
    }

    private readonly TEMPLATE_FORMAT_ACTION: WizardStep = async () => {
        //get the selected cdk application
        //get list of state machines in that cdk application
        //map that to PreviewStateMachineCDKWizardResponse 
        //const STATE_MACHINES = []

        const appLocation = this.cdkApplication ? this.cdkApplication.cdkApplocation : undefined
        const appNode = new AppNode(appLocation!)
        const constructNodes = await appNode.getChildren()
        const STATE_MACHINES = constructNodes.map(node => {
            return <ConstructNodePickItem><unknown>{
                //need to change this part!!!!!!!!!!!!!!!!
                //label: obj.cdkJsonPath,
                label: node.label,
                stateMachineNode: node
            }
        })



        const quickPick = picker.createQuickPick({
            options: {
                ignoreFocusOut: true,
                title: localize(
                    'AWS.message.prompt.selectCDKStateMachine.placeholder',
                    'Select State Machine'
                    //this.cdkApplication?this.cdkApplication.cdkApplocation.cdkJsonPath:'undefined'
                ),
                step: 2,
                totalSteps: 2,
            },
            buttons: [vscode.QuickInputButtons.Back],
            items: STATE_MACHINES,
            //items: STARTER_TEMPLATES,
        })

        const choices = await this.promptUser({
            picker: quickPick,
            onDidTriggerButton: (button, resolve) => {
                if (button === vscode.QuickInputButtons.Back) {
                    resolve(undefined)
                }
            },
        })

        this.stateMachine = picker.verifySinglePickerOutput<ConstructNodePickItem>(choices)

        return this.stateMachine ? WIZARD_TERMINATE : WIZARD_GOBACK
    }

    protected getResult() {
        return (
            (this.cdkApplication &&
                this.stateMachine && {
                cdkApplication: this.cdkApplication,
                stateMachine: this.stateMachine,
            }) ||
            undefined
        )
    }
}
