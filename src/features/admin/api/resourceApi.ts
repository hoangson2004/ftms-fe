import { axios } from '@/common/lib/axios'
import { compactObject, extractListResponse, unwrapApiData } from '@/common/lib/api'
import type { AnyRecord, ApiListResult } from '@/common/types/api'
import type { ResourceConfig, ResourceRecord } from '@/features/admin/types'

export async function searchResource(
  config: ResourceConfig,
  params: AnyRecord,
): Promise<ApiListResult<ResourceRecord>> {
  const response = await axios.get(config.basePath, {
    params: compactObject(params),
  })

  return extractListResponse<ResourceRecord>(response.data)
}

export async function createResource(config: ResourceConfig, payload: AnyRecord) {
  const response = await axios.post(config.basePath, payload)

  return unwrapApiData<ResourceRecord | ResourceRecord[]>(response.data)
}

export async function updateResource(
  config: ResourceConfig,
  id: string | number,
  payload: AnyRecord,
) {
  const response = await axios.put(`${config.basePath}/${id}`, payload)

  return unwrapApiData<ResourceRecord>(response.data)
}

export async function deleteResource(config: ResourceConfig, id: string | number) {
  await axios.delete(`${config.basePath}/${id}`)
}

export async function fetchRemoteOptions(sourcePath: string, params: AnyRecord = {}) {
  const response = await axios.get(sourcePath, {
    params: compactObject({
      offset: 0,
      limit: 100,
      ...params,
    }),
  })

  return extractListResponse<ResourceRecord>(response.data).items
}
