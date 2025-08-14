
import keytar from 'keytar'
import crypto from 'crypto'
import os from 'os'
import fs from 'fs'
import path from 'path'

const SERVICE = 'BitpandaBalancer'
const ACCOUNT = 'apiKey'
const cfgPath = path.join(os.homedir(), '.bitpanda-balancer', 'cfg.enc')

function deriveKey(master: string) {
  const salt = Buffer.from('bpbalancer_salt_v1')
  return crypto.scryptSync(master, salt, 32)
}

export const secureStore = {
  async saveApiKey(apiKey: string) {
    try { await keytar.setPassword(SERVICE, ACCOUNT, apiKey); return true } catch {}
    const master = process.env.BPB_MASTER || 'dev-master'
    const key = deriveKey(master)
    const iv = crypto.randomBytes(12)
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
    const enc = Buffer.concat([cipher.update(apiKey, 'utf8'), cipher.final()])
    const tag = cipher.getAuthTag()
    fs.mkdirSync(path.dirname(cfgPath), { recursive: true })
    fs.writeFileSync(cfgPath, Buffer.concat([iv, tag, enc]))
    return true
  },
  async getApiKey() {
    try { const v = await keytar.getPassword(SERVICE, ACCOUNT); if (v) return v } catch {}
    if (!fs.existsSync(cfgPath)) return null
    const raw = fs.readFileSync(cfgPath)
    const iv = raw.subarray(0,12)
    const tag = raw.subarray(12,28)
    const enc = raw.subarray(28)
    const master = process.env.BPB_MASTER || 'dev-master'
    const key = deriveKey(master)
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(tag)
    const dec = Buffer.concat([decipher.update(enc), decipher.final()])
    return dec.toString('utf8')
  }
}
