import "server-only";
import { hasSupabase } from "@/lib/env";
import { memoryRepo } from "./memory";
import { supabaseRepo } from "./supabase";
import type { Repo } from "./types";

export const repo: Repo = hasSupabase ? supabaseRepo : memoryRepo;
export type { Repo, NewOrder } from "./types";
