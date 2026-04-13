// test/repositories/in-memory-urls-repository.ts

import { randomUUID } from 'node:crypto'
import { IUrlsRepository } from '@/types/repsoitory'
import { Urls, Prisma } from '@prisma/client'

export class InMemoryUrlsRepository implements IUrlsRepository {
  public items: Urls[] = []

  async createUrl(url:string, alias:string,users_id: string): Promise<Urls> {
    const newUrl: Urls = {
        id: String(randomUUID),
        url,
        alias,
        status: 1,
        counter: 0,
        created_at: new Date(),
        deleted_at: null,
        updated_at: null,
        users_id
    }

    this.items.push(newUrl)
    return newUrl
  }

  async findUrlByAlias(alias: string): Promise<Urls | null> {
    return this.items.find(item => item.alias === alias) ?? null
  }

  async addCount(id: string): Promise<Urls> {
    const item = this.items.find(i => i.id === id)
    if (!item) throw new Error('URL not found')

    item.counter++
    return item
  }

  async listUrls(users_id: string): Promise<Urls[]> {
    return this.items.filter(i => i.users_id === users_id)
  }

  async updateUrl(
    newUrl: string,
    id_url: string,
    users_id: string,
  ): Promise<number> {
    const item = this.items.find(
      i => i.id === id_url && i.users_id === users_id,
    )

    if (!item) return 0

    item.url = newUrl
    return 1
  }

  async deleteUrl(users_id: string, id_url: string): Promise<number> {
    const index = this.items.findIndex(
      i => i.id === id_url && i.users_id === users_id,
    )

    if (index === -1) return 0

    this.items.splice(index, 1)
    return 1
  }

  async checkOwner(
    users_id: string,
    url_id: string,
  ): Promise<Urls | null> {
    return (
      this.items.find(
        i => i.id === url_id && i.users_id === users_id,
      ) ?? null
    )
  }
}