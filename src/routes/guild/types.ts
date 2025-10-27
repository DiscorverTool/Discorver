export type WidgetResult = {
  id: string
  name: string
  instant_invite: any
  channels: Array<{
    id: string
    name: string
    position: number
  }>
  members: Array<{
    id: string
    username: string
    discriminator: string
    avatar: any
    status: string
    avatar_url: string
    game?: {
      name: string
    }
  }>
  presence_count: number
}