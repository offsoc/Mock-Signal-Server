// Copyright 2022 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import z from 'zod';

import {
  AciString,
  DeviceId,
  PniString,
  RegistrationId,
  ServiceIdString,
} from '../types';
import { fromBase64, fromURLSafeBase64 } from '../util';

export const PositiveInt = z.coerce.number().int().nonnegative();

export const AciSchema = z.string().transform((x) => x as AciString);
export const PniSchema = z
  .string()
  .refine((x) => x.startsWith('PNI:'))
  .transform((x) => x as PniString);
export const ServiceIdSchema = z
  .string()
  .transform((x) => x as ServiceIdString);
export const RegistrationIdSchema = z
  .number()
  .transform((x) => x as RegistrationId);
export const DeviceIdSchema = z.number().transform((x) => x as DeviceId);

const PreKeySchema = z.object({
  keyId: z.number(),
  publicKey: z.string(),
});
export type ServerPreKey = z.infer<typeof PreKeySchema>;

const SignedPreKeySchema = z.object({
  keyId: z.number(),
  publicKey: z.string(),
  signature: z.string(),
});
export type ServerSignedPreKey = z.infer<typeof SignedPreKeySchema>;

export const DeviceKeysSchema = z.object({
  preKeys: PreKeySchema.array(),
  pqPreKeys: SignedPreKeySchema.array().optional(),
  pqLastResortPreKey: SignedPreKeySchema.optional(),
  signedPreKey: SignedPreKeySchema.optional(),
});

export type DeviceKeys = z.infer<typeof DeviceKeysSchema>;

export const MessageSchema = z.object({
  // NOTE: Envelope.Type
  type: z.number(),
  destinationDeviceId: DeviceIdSchema,
  destinationRegistrationId: RegistrationIdSchema,
  content: z.string(),
});

export type Message = z.infer<typeof MessageSchema>;

export const MessageListSchema = z.object({
  messages: MessageSchema.array(),
  timestamp: z.number(),
});

export type MessageList = z.infer<typeof MessageListSchema>;

export const AtomicLinkingDataSchema = z.object({
  verificationCode: z.string(),
  accountAttributes: z.object({
    fetchesMessages: z.boolean(),
    registrationId: RegistrationIdSchema,
    pniRegistrationId: RegistrationIdSchema,
    name: z.string(),
  }),
  aciSignedPreKey: SignedPreKeySchema,
  pniSignedPreKey: SignedPreKeySchema,
  aciPqLastResortPreKey: SignedPreKeySchema,
  pniPqLastResortPreKey: SignedPreKeySchema,
});

export const GroupStateSchema = z.object({
  publicKey: z.instanceof(Uint8Array),
  version: z.literal(0),
  accessControl: z.object({
    attributes: z.number(),
    members: z.number(),
    addFromInviteLink: z.number(),
  }),
  members: z.unknown().array().min(1),
});

export const UsernameReservationSchema = z.object({
  usernameHashes: z
    .string()
    .transform(fromURLSafeBase64)
    .array()
    .min(1)
    .max(20),
});

export type UsernameReservation = z.infer<typeof UsernameReservationSchema>;

export const UsernameConfirmationSchema = z.object({
  usernameHash: z.string().transform(fromURLSafeBase64),
  zkProof: z.string().transform(fromURLSafeBase64),
  encryptedUsername: z.string().transform(fromURLSafeBase64).optional(),
});

export type UsernameConfirmation = z.infer<typeof UsernameConfirmationSchema>;

export const PutUsernameLinkSchema = z.object({
  usernameLinkEncryptedValue: z.string().transform(fromURLSafeBase64),
});

export type PutUsernameLink = z.infer<typeof PutUsernameLinkSchema>;

export const CreateCallLinkAuthSchema = z.object({
  createCallLinkCredentialRequest: z.string().transform(fromBase64),
});

export type CreateCallLinkAuth = z.infer<typeof CreateCallLinkAuthSchema>;

export const CreateCallLinkSchema = z.object({
  adminPasskey: z.string().transform(fromBase64),
  zkparams: z.string().transform(fromBase64),
});

export type CreateCallLink = z.infer<typeof CreateCallLinkSchema>;

export const UpdateCallLinkSchema = z.object({
  adminPasskey: z.string().transform(fromBase64),
  name: z.string().optional(),
  restrictions: z.enum(['none', 'adminApproval']).optional(),
  revoked: z.boolean().optional(),
});

export type UpdateCallLink = z.infer<typeof UpdateCallLinkSchema>;

export const DeleteCallLinkSchema = z.object({
  adminPasskey: z.string().transform(fromBase64),
});

export type DeleteCallLink = z.infer<typeof DeleteCallLinkSchema>;

export const SetBackupIdSchema = z.object({
  messagesBackupAuthCredentialRequest: z.string().transform(fromBase64),
  mediaBackupAuthCredentialRequest: z.string().transform(fromBase64),
});

export type SetBackupId = z.infer<typeof SetBackupIdSchema>;

export const BackupHeadersSchema = z.object({
  'x-signal-zk-auth': z.string().transform(fromBase64),
  'x-signal-zk-auth-signature': z.string().transform(fromBase64),
});

export type BackupHeaders = z.infer<typeof BackupHeadersSchema>;

export const SetBackupKeySchema = z.object({
  backupIdPublicKey: z.string().transform(fromBase64),
});

export type SetBackupKey = z.infer<typeof SetBackupKeySchema>;

export const BackupMediaBatchSchema = z.object({
  items: z
    .object({
      sourceAttachment: z.object({
        cdn: z.number(),
        key: z.string(),
      }),
      objectLength: z.number(),
      mediaId: z.string(),
      hmacKey: z.string().transform(fromBase64),
      encryptionKey: z.string().transform(fromBase64),
      iv: z.string().transform(fromBase64),
    })
    .array(),
});

export type BackupMediaBatch = z.infer<typeof BackupMediaBatchSchema>;
