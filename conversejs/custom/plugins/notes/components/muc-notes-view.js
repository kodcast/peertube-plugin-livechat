// SPDX-FileCopyrightText: 2024 John Livingston <https://www.john-livingston.fr/>
//
// SPDX-License-Identifier: AGPL-3.0-only

import { api } from '@converse/headless'
import tplMucNotes from '../templates/muc-notes'
import { __ } from 'i18n'
import { DraggablesCustomElement } from '../../../shared/components/draggables/index.js'

import '../styles/muc-notes.scss'

export default class MUCNotesView extends DraggablesCustomElement {
  static get properties () {
    return {
      model: { type: Object, attribute: true },
      create_note_error_message: { type: String, attribute: false },
      create_note_opened: { type: Boolean, attribute: false }
    }
  }

  async initialize () {
    this.create_note_error_message = ''

    if (!this.model) {
      return
    }

    this.draggableTagName = 'livechat-converse-muc-note'
    this.droppableTagNames = ['livechat-converse-muc-note']
    this.droppableAlwaysBottomTagNames = []

    // Adding or removing a new note: we must update.
    this.listenTo(this.model, 'add', () => this.requestUpdate())
    this.listenTo(this.model, 'remove', () => this.requestUpdate())
    this.listenTo(this.model, 'sort', () => this.requestUpdate())

    await super.initialize()
  }

  render () {
    return tplMucNotes(this, this.model)
  }

  async openCreateNoteForm (ev) {
    ev?.preventDefault?.()
    this.create_note_opened = true
    await this.updateComplete
    const textarea = this.querySelector('.notes-create-note textarea[name="description"]')
    if (textarea) {
      textarea.focus()
    }
  }

  closeCreateNoteForm (ev) {
    ev?.preventDefault?.()
    this.create_note_opened = false
  }

  async submitCreateNote (ev) {
    ev.preventDefault()

    const description = ev.target.description.value
    if (this.create_note_error_message) {
      this.create_note_error_message = ''
    }

    if ((description ?? '') === '') { return }

    try {
      this.querySelectorAll('input[type=submit]').forEach(el => {
        el.setAttribute('disabled', true)
        el.classList.add('disabled')
      })

      await this.model.createNote({
        description: description
      })

      this.closeCreateNoteForm()
    } catch (err) {
      console.error(err)
      // eslint-disable-next-line no-undef
      this.create_note_error_message = __(LOC_moderator_notes_create_error)
    } finally {
      this.querySelectorAll('input[type=submit]').forEach(el => {
        el.removeAttribute('disabled')
        el.classList.remove('disabled')
      })
    }
  }

  _dropDone (draggedEl, droppedOnEl, onTopHalf) {
    super._dropDone(...arguments)
    console.log('[livechat note drag&drop] Note dropped...')

    const note = draggedEl.model
    if (!note) {
      throw new Error('No model for the draggedEl')
    }
    const targetNote = droppedOnEl.model
    if (!targetNote) {
      throw new Error('No model for the droppedOnEl')
    }
    if (note === targetNote) {
      console.log('[livechat note drag&drop] Note dropped on itself, nothing to do')
      return
    }

    let newOrder = targetNote.get('order') ?? 0
    if (onTopHalf) { newOrder = Math.max(0, newOrder + 1) } // reverse order!

    // Warning: the order of the collection is reversed!
    // _saveOrders needs it in ascending order!
    this._saveOrders(Array.from(this.model).reverse(), note, newOrder)
  }
}

api.elements.define('livechat-converse-muc-notes', MUCNotesView)
