import { env } from '@/env'
import { UrlNotFind, UrlsNotFound } from '@/erros/urlsErros'
import { IUrlsRepository } from '@/types/repsoitory'
import { generateSixRandomCharacters } from '@/utils/randomCharacters'
import { Urls } from '@prisma/client'

export class UrlsServices {
  constructor(private urlsRepository: IUrlsRepository) {}

  public async shortenUrlsService(url: string, user_id?: string) {
    let newUrl: Urls
    if (user_id) {
      const alias = generateSixRandomCharacters()
      newUrl = await this.urlsRepository.createUrl(url, alias, user_id)
      return env.DEFAULT_URL + '/' + newUrl.alias
    } else {
      const alias = generateSixRandomCharacters()
      newUrl = await this.urlsRepository.createUrl(url, alias)
      return env.DEFAULT_URL + '/' + newUrl.alias
    }
  }

  public async findUrlAndRedirectService(alias: string) {
    const urlOriginal = await this.urlsRepository.findUrlByAlias(alias)
    if (!urlOriginal) {
      throw new UrlNotFind()
    }
    await this.urlsRepository.addCount(urlOriginal.id)
    return { urlOriginal }
  }

  public async listUrlsByUserIdService(user_id: string) {
    const urls = await this.urlsRepository.listUrls(user_id)
    if (urls.length === 0) {
      throw new UrlsNotFound()
    }
    return urls.map(({ id, url, alias, counter }) => ({
      id,
      url,
      alias,
      counter,
    }))
  }

  public async updateUrlsByUserIdService(
    id_url: string,
    newUrl: string,
    user_id: string,
  ) {
    const updated = await this.urlsRepository.updateUrl(newUrl, id_url, user_id)
    if (!updated) {
      throw new UrlNotFind()
    }
    return { newUrl }
  }

  public async deleteUrlsByIdService(id_url: string, users_id: string) {
    const toDelete = await this.urlsRepository.deleteUrl(users_id, id_url)
    if (!toDelete) {
      throw new UrlNotFind()
    }
    return true
  }
}
