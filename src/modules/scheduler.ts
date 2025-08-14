import cron from 'node-cron'
let task: cron.ScheduledTask | null = null
export function scheduleJob(expr: string, fn: () => Promise<void>) { if (task) task.stop(); task = cron.schedule(expr, fn, { scheduled: true }); return true }
export function cancelJob() { if (task) { task.stop(); task = null }; return true }
