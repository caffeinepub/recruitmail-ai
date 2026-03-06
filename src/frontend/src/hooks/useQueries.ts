import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  EmailHistory,
  EmailTemplate,
  Resume,
  SmtpConfig,
} from "../backend.d";
import { EmailStatus } from "../backend.d";
import { useActor } from "./useActor";

/* ─── Query Keys ─────────────────────────────────────────── */
export const QK = {
  templates: ["templates"],
  history: ["history"],
  resumes: ["resumes"],
  smtp: ["smtp"],
} as const;

/* ─── Email Templates ────────────────────────────────────── */
export function useEmailTemplates() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: QK.templates,
    queryFn: async () => {
      if (!actor) return [] as EmailTemplate[];
      return actor.getAllEmailTemplates();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateTemplate() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      name: string;
      subject: string;
      body: string;
      variables: string[];
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createEmailTemplate(
        vars.name,
        vars.subject,
        vars.body,
        vars.variables,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.templates }),
  });
}

export function useUpdateTemplate() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      id: bigint;
      subject: string;
      body: string;
      variables: string[];
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateEmailTemplate(
        vars.id,
        vars.subject,
        vars.body,
        vars.variables,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.templates }),
  });
}

export function useDeleteTemplate() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteEmailTemplate(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.templates }),
  });
}

/* ─── Email History ──────────────────────────────────────── */
export function useEmailHistory() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: QK.history,
    queryFn: async () => {
      if (!actor) return [] as EmailHistory[];
      return actor.getAllEmailHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateEmailHistory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (record: EmailHistory) => {
      if (!actor) throw new Error("No actor");
      return actor.createEmailHistory(record);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.history }),
  });
}

export function useDeleteEmailHistory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteEmailHistory(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.history }),
  });
}

export function useResendEmail() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.markEmailHistoryPending(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.history }),
  });
}

/* ─── Resumes ────────────────────────────────────────────── */
export function useResumes() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: QK.resumes,
    queryFn: async () => {
      if (!actor) return [] as Resume[];
      return actor.getAllResumes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateResume() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { name: string; isDefault: boolean }) => {
      if (!actor) throw new Error("No actor");
      return actor.createResume(vars.name, vars.isDefault);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.resumes }),
  });
}

export function useDeleteResume() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteResume(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.resumes }),
  });
}

export function useMarkDefaultResume() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.markDefaultResume(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.resumes }),
  });
}

/* ─── SMTP Config ────────────────────────────────────────── */
export function useSmtpConfig() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: QK.smtp,
    queryFn: async () => {
      if (!actor) return null;
      return actor.getSmtpConfig();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetSmtpConfig() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (config: SmtpConfig) => {
      if (!actor) throw new Error("No actor");
      return actor.setSmtpConfig(config);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.smtp }),
  });
}

/* ─── Seed Data ──────────────────────────────────────────── */
export function useSeedData() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.seedData();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.history });
      qc.invalidateQueries({ queryKey: QK.templates });
      qc.invalidateQueries({ queryKey: QK.resumes });
    },
  });
}

/* ─── Re-export types ────────────────────────────────────── */
export type { EmailHistory, EmailTemplate, Resume, SmtpConfig };
export { EmailStatus };
