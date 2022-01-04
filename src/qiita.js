'use babel'
import MetadataParser from 'markdown-yaml-metadata-parser'
import { Qiita } from 'qiita-js-2'
import yaml from 'js-yaml'

const client = new Qiita({
  token: isTeam() ? inkdrop.config.get('qiita-connect.teamToken') : inkdrop.config.get('qiita-connect.token'),
})

function isTeam() {
 return inkdrop.config.get('qiita-connect.mode') == 'team'
}

export async function publish() {
  const { noteListBar, notes } = inkdrop.store.getState()
  const noteIds = noteListBar.actionTargetNoteIds

  if (noteIds.length === 0 || Object.keys(notes.hashedItems).length === 0) {
    throw new Error('No note(s) selected.')
  }

  const files = {}

  for (const noteId of noteIds) {
    const note = notes.hashedItems[noteId]
    files[note.title] = { content: note.body }
  }

  try {
    const { noteListBar, notes } = inkdrop.store.getState()
    const noteIds = noteListBar.actionTargetNoteIds

    if (noteIds.length === 0 || Object.keys(notes.hashedItems).length === 0) {
      throw new Error('No note(s) selected.')
    }

    const files = {}

    for (const noteId of noteIds) {
      const note = notes.hashedItems[noteId]
      files[note.title] = { content: note.body }
    }

    const posts = await getPosts()

    for (const [key, value] of Object.entries(files)) {
      const { metadata, content } = MetadataParser(value.content)
      const found = findPost({ posts, title: key, metadata })
      const { cm } = inkdrop.getActiveEditor()
      if (found) {
        //Edit
        await createPost({ markdown: content, title: key, metadata: metadata, foundPost: found, })
        // if no metadata edit the post and put it in there!
        if (metadata && Object.keys(metadata).length === 0) {
          cm.doc.setValue(getMetadataTag({ post: found, metadata }) + content)
        }
      } else {
        //Create
        const post = await createPost({ markdown: content, title: key, metadata: metadata, })
        if (post) {
          cm.doc.setValue(getMetadataTag({ post }) + content)
        } else {
          throw new Error('Failed to post')
        }
      }
    }
  } catch (e) {
    console.log('itz broken!', e)
    throw e
  }

  return true
}

function getPosts() {
  return toArray(client.fetchMyItems())//fetchMyItems()
}

async function toArray(asyncIterator){ 
  const arr=[]; 
  for await(const i of asyncIterator) arr.push(i); 
  return arr;
}

function findPost({ posts, metadata, title }) {
  if (metadata && Object.keys(metadata).qiitaId !== undefined) {
    console.log('Finding by metadata')
    return findPostWithMetadata({ metadata, posts })
  } else if (title) {
    console.log('Finding by title')
    return findPostWithTitle({ posts, title })
  }
  throw new Error('Unsupported find post')
}

function findPostWithMetadata({ metadata, posts }) {
  return posts[0].find((post) => post.id === metadata.qiitaId)
}

function findPostWithTitle({ posts, title }) {
  return posts[0].find((post) => post.title === title)
}

// @TODO: maybe get some getTitle functions?  Maybe make a Post object to do this?
function getMetadataTag({ post, metadata }) {
  const newMetadata = {
    ...metadata,
    //qiitaTitle: post.title,
    qiitaId: post.id,
    //link: post.url,
    //tags: post.tags ? post.tags.map(tag => tag.name) : [],
  };
  const yamlText = yaml.dump(newMetadata)+''
  return `---
${yamlText}---
`
}

function createPost({ markdown, title, metadata, foundPost }) {
  if (metadata.private) {
    throw new Error('Please set "private" to false before publishing')
  }else if (metadata.tags && metadata.tags.length > 0) {
    let options = {
      body: markdown,
      gist: metadata.gist ?? false,
      tags: metadata.tags ? metadata.tags.map(tagName => {return {name: tagName, versions: []}}) : [],
      title: title !== "" ? title : 'untitled',
      tweet: metadata.tweet ?? false,
    }
    if (isTeam()) {
      //Team
      options = {
        ...options,
        coediting: metadata.coediting ?? false,
        group_url_name: metadata.groupUrlName ?? '',
      }
    }else{
      //Individual
      options = {
        ...options,
        private: metadata.private ?? false,
      }
    }
    if (foundPost) {
      return client.updateItem(foundPost.id,options)
    } else {
      return client.createItem(options)
    }
  } else {
    throw new Error('Please specify one or more tags')
  }
}

export async function sync() {
  const { noteListBar, notes } = inkdrop.store.getState()
  const noteIds = noteListBar.actionTargetNoteIds

  if (noteIds.length === 0 || Object.keys(notes.hashedItems).length === 0) {
    throw new Error('No note(s) selected.')
  }

  const files = {}

  for (const noteId of noteIds) {
    const note = notes.hashedItems[noteId]
    files[note.title] = { content: note.body }
  }

  try {
    const { noteListBar, notes } = inkdrop.store.getState()
    const { cm } = inkdrop.getActiveEditor()

    const noteIds = noteListBar.actionTargetNoteIds

    if (noteIds.length === 0 || Object.keys(notes.hashedItems).length === 0) {
      throw new Error('No note(s) selected.')
    }

    const files = {}

    for (const noteId of noteIds) {
      const note = notes.hashedItems[noteId]
      files[note.title] = { content: note.body }
    }

    const posts = await getPosts()

    for (const [key, value] of Object.entries(files)) {
      const { metadata } = MetadataParser(value.content)
      const found = findPost({ posts, title: key, metadata })

      if (found) {
        const md = found.body

        cm.doc.setValue(getMetadataTag({ post: found, metadata }) + md)
      } else {
        throw new Error('No article was found from id or title')
      }
    }
  } catch (e) {
    console.log('itz broken!', e)
    throw e
  }

  return true
}

export async function syncAllPosts() {
  const db = inkdrop.main.dataStore.getLocalDB()
  const { bookList, notes } = inkdrop.store.getState()

  const book = bookList.bookForContextMenu
  const posts = await getPosts()

  const noteIds = notes.items
    .map((note) => MetadataParser(note.body).metadata.qiitaId || undefined)
    .filter((v) => v !== undefined)

  const files = {}
  noteIds.forEach((id) => {
    files[id] = notes.items.find((note) => MetadataParser(note.body).metadata.qiitaId === id)
  })

  const existingPosts = posts[0].filter((post) => noteIds.includes(post.id))
  const newPosts = posts[0].filter((post) => !noteIds.includes(post.id))

  // update existing posts
  const editPostPromises = existingPosts.map((post) => {
    const md = post.body
    const note = {
      ...files[post.id],
      doctype: 'markdown',
      body: getMetadataTag({ post }) + md,
      title: post.title,
      updatedAt: +new Date(),
    }
    return db.notes.put(note)
  })

  // create new posts
  const newPostPromises = newPosts.map((post) => {
    const md = post.body
    const note = {
      bookId: book._id,
      doctype: 'markdown',
      body: getMetadataTag({ post }) + md,
      _id: db.notes.createId(),
      _rev: undefined,
      title: post.title,
      createdAt: +new Date(),
      updatedAt: +new Date(),
    }
    return db.notes.put(note)
  })

  await Promise.all([...newPostPromises, ...editPostPromises])
}