import { AsyncLocalStorage } from 'node:async_hooks';
import type { Request } from 'express';

export const requestStorage = new AsyncLocalStorage<Request>();
