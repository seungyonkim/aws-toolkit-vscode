/*!
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CredentialType } from '../../shared/telemetry/telemetry.gen'
import { CredentialsProviderId } from './credentialsProviderId'

export interface CredentialsProvider {
    getCredentialsProviderId(): CredentialsProviderId
    /**
     * Gets the credential type, mostly for use in telemetry.
     */
    getCredentialsType(): CredentialType
    getDefaultRegion(): string | undefined
    getHashCode(): string
    getCredentials(): Promise<AWS.Credentials>
    canAutoConnect(): boolean
}
