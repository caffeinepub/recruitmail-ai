import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface EmailTemplate {
    id: bigint;
    subject: string;
    body: string;
    name: string;
    createdAt: bigint;
    isActive: boolean;
    variables: Array<string>;
    updatedAt: bigint;
}
export interface EmailHistory {
    id: bigint;
    status: EmailStatus;
    subject: string;
    templateId: bigint;
    recruiterEmail: string;
    recruiterName: string;
    sentAt: bigint;
    company: string;
    jobTitle: string;
    repliedAt?: bigint;
    openedAt?: bigint;
}
export interface Resume {
    id: bigint;
    name: string;
    isDefault: boolean;
    uploadedAt: bigint;
}
export interface SmtpConfig {
    host: string;
    password: string;
    port: bigint;
    email: string;
    isConnected: boolean;
    fromName: string;
    replyTo: string;
    encryptionType: string;
}
export enum EmailStatus {
    pending = "pending",
    sent = "sent",
    failed = "failed"
}
export interface backendInterface {
    createEmailHistory(record: EmailHistory): Promise<EmailHistory>;
    createEmailTemplate(name: string, subject: string, body: string, variables: Array<string>): Promise<EmailTemplate>;
    createResume(name: string, isDefault: boolean): Promise<Resume>;
    deleteEmailHistory(id: bigint): Promise<boolean>;
    deleteEmailTemplate(id: bigint): Promise<boolean>;
    deleteResume(id: bigint): Promise<boolean>;
    getAllEmailHistory(): Promise<Array<EmailHistory>>;
    getAllEmailTemplates(): Promise<Array<EmailTemplate>>;
    getAllResumes(): Promise<Array<Resume>>;
    getEmailTemplate(id: bigint): Promise<EmailTemplate | null>;
    getSmtpConfig(): Promise<SmtpConfig | null>;
    markDefaultResume(id: bigint): Promise<Resume | null>;
    markEmailHistoryPending(id: bigint): Promise<EmailHistory | null>;
    seedData(): Promise<void>;
    setSmtpConfig(config: SmtpConfig): Promise<void>;
    updateEmailTemplate(id: bigint, subject: string, body: string, variables: Array<string>): Promise<EmailTemplate | null>;
}
