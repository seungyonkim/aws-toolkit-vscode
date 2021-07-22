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

export interface CdkAppLocationPickItem {
    label: string,
    cdkApplocation: CdkAppLocation
}
export interface ConstructNodePickItem {
    label: string,
    stateMachineNode: ConstructNode
}

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
        //need to pick out only the applications containing a state machine 
        const CDK_APPLOCATIONS = cdkAppLocations.map(obj => {
            return <CdkAppLocationPickItem><unknown>{
                //need to change this part!!!!!!!!!!!!!!!!
                label: obj.cdkJsonPath,
                cdkAppLocation: obj
            }
        })
        const quickPick = picker.createQuickPick<CdkAppLocationPickItem>({
            options: {
                ignoreFocusOut: true,
                title: localize(
                    'AWS.message.prompt.selectCDKApplication.placeholder',
                    'Select CDK application'
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
        const STATE_MACHINES = []

        const quickPick = picker.createQuickPick({
            options: {
                ignoreFocusOut: true,
                title: localize(
                    'AWS.message.prompt.selectCDKStateMachine.placeholder',
                    'Select a State Machine'
                ),
                step: 2,
                totalSteps: 2,
            },
            buttons: [vscode.QuickInputButtons.Back],
            items: STATE_MACHINES,
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


// /*!
//  * Copyright 2018-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  * SPDX-License-Identifier: Apache-2.0
//  */

// import * as nls from 'vscode-nls'
// const localize = nls.loadMessageBundle()

// import * as vscode from 'vscode'
// import * as picker from '../../shared/ui/picker'
// import { detectCdkProjects, detectLocalCdkProjects } from '../explorer/detectCdkProjects'

// import {
//     MultiStepWizard,
//     WIZARD_GOBACK,
//     WIZARD_TERMINATE,
//     wizardContinue,
//     WizardStep,
// } from '../../shared/wizards/multiStepWizard'
// import { ConstructNode } from '../explorer/nodes/constructNode'
// import { CdkAppLocation } from '../explorer/cdkProject'
// import { AppNode } from '../explorer/nodes/appNode'
// import { AWSTreeNodeBase } from '../../../src/shared/treeview/nodes/awsTreeNodeBase'
// import { TemplateFormats } from '../../../src/stepFunctions/wizards/createStateMachineWizard'

// //export interface StateMachineTemplateQuickPickItem {
//     //label: string
//     //description: string
//     //Name: string
// //}
// export interface CDKAppListPickItem {
//     label: string,
//     treeNodeBase: AWSTreeNodeBase
// }

// export interface StateMachineListPickItem {
//     node: ConstructNode
// }

// //export const STARTER_TEMPLATES: StateMachineTemplateQuickPickItem[] = [
//     // {
//     //     label: localize('AWS.stepfunctions.template.helloWorld.label', 'Hello world'),
//     //     description: localize(
//     //         'AWS.stepfunctions.template.helloWorld.description',
//     //         'A basic example using a Pass state.'
//     //     ),
//     //     fileName: 'HelloWorld.asl.json',
//     // },
// //]

// export async function getCdkAppList(): Promise<AWSTreeNodeBase[]>{
//     const appsFound = await detectCdkProjects(vscode.workspace.workspaceFolders)

//             if (appsFound.length === 0) {
//                 return []
//             }

//             return appsFound.map(appLocation => new AppNode(appLocation))
// }

// export async function getCdkAppListPickItem(): Promise<CDKAppListPickItem[]>{
//     let cdkAppList: CDKAppListPickItem[] = []
//     let appsFound = await getCdkAppList()
//     if(appsFound.length===0) return []

//     for(var app of appsFound){
//         cdkAppList.push({label:app.label!,treeNodeBase:app})
//     }
//     return cdkAppList
// }

// export async function getStatemachinesInCdkApp(cdkApp : AWSTreeNodeBase): Promise<ConstructNode[]>{
//     return []
// }

// //const TEMPLATE_FORMATS = [{ label: TemplateFormats.JSON }, { label: TemplateFormats.YAML }]

// interface CreateStateMachineWizardResponse {
//     appList: CDKAppListPickItem
//     stateMachine: StateMachineListPickItem
// }

// export default class CreateStateMachineWizard extends MultiStepWizard<CreateStateMachineWizardResponse> {
//     private appList?: CDKAppListPickItem
//     private stateMachine?: StateMachineListPickItem
//     private promptUser: typeof picker.promptUser

//     public constructor(promptUser?: typeof picker.promptUser) {
//         super()

//         this.promptUser = promptUser || picker.promptUser.bind(picker)
//     }

//     protected get startStep() {
//         return this.CREATE_TEMPLATE_ACTION
//     }

//     private readonly CREATE_TEMPLATE_ACTION: WizardStep = async () => {
//         const quickPick = picker.createQuickPick<CDKAppListPickItem>({
//             options: {
//                 ignoreFocusOut: true,
//                 title: localize(
//                     'AWS.message.prompt.selectStateMachineTemplate.placeholder',
//                     'Select a starter template'
//                 ),
//                 step: 1,
//                 totalSteps: 2,
//             },
//             buttons: [vscode.QuickInputButtons.Back],
//             items: await getCdkAppListPickItem(),
//         })

//         const choices = await this.promptUser({
//             picker: quickPick,
//             onDidTriggerButton: (button, resolve) => {
//                 if (button === vscode.QuickInputButtons.Back) {
//                     resolve(undefined)
//                 }
//             },
//         })

//         this.appList = picker.verifySinglePickerOutput<CDKAppListPickItem>(choices)

//         return this.appList ? wizardContinue(this.TEMPLATE_FORMAT_ACTION) : WIZARD_GOBACK
//     }

//     private readonly TEMPLATE_FORMAT_ACTION: WizardStep = async () => {
//         const quickPick = picker.createQuickPick({
//             options: {
//                 ignoreFocusOut: true,
//                 title: localize(
//                     'AWS.message.prompt.selectStateMachineTemplateFormat.placeholder',
//                     'Select template format'
//                 ),
//                 step: 2,
//                 totalSteps: 2,
//             },
//             buttons: [vscode.QuickInputButtons.Back],
//             items: [],
//         })

//         const choices = await this.promptUser({
//             picker: quickPick,
//             onDidTriggerButton: (button, resolve) => {
//                 if (button === vscode.QuickInputButtons.Back) {
//                     resolve(undefined)
//                 }
//             },
//         })

//         //need to fix this part 
//         //this.stateMachine = picker.verifySinglePickerOutput<{ label: StateMachineListPickItem }>(choices)?.label

//         return this.stateMachine ? WIZARD_TERMINATE : WIZARD_GOBACK
//     }

//     protected getResult() {
//         return (
//             (this.appList &&
//                 this.stateMachine && {
//                     appList: this.appList,
//                     stateMachine: this.stateMachine,
//                 }) ||
//             undefined
//         )
//     }
// }