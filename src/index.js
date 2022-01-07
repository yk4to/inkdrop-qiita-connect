'use babel'
import { publish, sync, syncAllPosts } from './qiita'

let commandListener = null

function notify(level, message, details) {
  const options = {
    dismissable: true,
  }

  if (typeof details === 'string') {
    options.detail = details
  }

  inkdrop.notifications[`add${level}`](message, options)
}

async function doPublish() {
  try {
    await publish()
    notify(
      'Success',
      `Successfully exported to Qiita`,
      `The selected note has been published to your Qiita page.`
    )
  } catch (err) {
    console.error(err)
    notify('Error', 'Something went wrong while exporting', err.message)
  }
}

async function doSync() {
  try {
    await sync()
    notify(
      'Success',
      `Successfully synced with Qiita`,
      `The selected note has been updated with the latest from your Qiita page.`
    )
  } catch (err) {
    console.error(err)
    notify('Error', 'Something went wrong while syncing', err.message)
  }
}

async function doSyncFolder() {
  try {
    await syncAllPosts()
    notify(
      'Success',
      `Successfully synced with Qiita`,
      `The selected note has been updated with the latest from your Qiita page.`
    )
  } catch (err) {
    console.error(err)
    notify('Error', 'Something went wrong while syncing', err.message)
  }
}

module.exports = {
  config: {
    token: {
      title: 'Qiita Access Token',
      description: '',
      type: 'string',
      default: '',
    },
    teamToken: {
      title: 'Qiita Team Access Token',
      description: '',
      type: 'string',
      default: '',
    },
    mode: {
      title: 'Mode',
      description: '',
      type: 'string',
      default: 'individual',
      enum: ['individual','team'],
    },
    openUrlEnabled: {
      title: 'Open URL In Browser After Posting',
      description: '',
      type: 'boolean',
      default: true,
    },
  },

  activate: () => {
    commandListener = inkdrop.commands.add(document.body, {
      'qiita-connect:publish-single': () => doPublish(),
      'qiita-connect:sync-single': () => doSync(),
      'qiita-connect:sync-folder': () => doSyncFolder(),
    })
  },

  deactivate: () => {
    commandListener.dispose()
  }
}
