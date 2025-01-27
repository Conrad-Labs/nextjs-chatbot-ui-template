import reducer, {
  addMessage,
  setThreadId,
  removeMessages,
  updateFiles,
  Roles,
  ChatMessage
} from '@/lib/redux/slice/chat.slice'

describe('chatSlice', () => {
  const initialState = { messages: [], threadId: '' }

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: '' })).toEqual(initialState)
  })

  describe('addMessage', () => {
    it('should add a new message to the state', () => {
      const newMessage: ChatMessage = {
        id: '1',
        message: 'Hello',
        role: Roles.user
      }

      const result = reducer(initialState, addMessage(newMessage))
      expect(result.messages).toHaveLength(1)
      expect(result.messages[0]).toEqual(newMessage)
    })

    it('should update an existing message if the id matches', () => {
      const existingState = {
        ...initialState,
        messages: [{ id: '1', message: 'Hello', role: Roles.user }]
      }

      const updatedMessage = {
        id: '1',
        message: 'Hello, updated',
        citations: [
          {
            text: 'citation',
            index: 1,
            start_index: 0,
            end_index: 1,
            file_name: 'test.txt'
          }
        ]
      }

      const result = reducer(existingState, addMessage(updatedMessage))
      expect(result.messages).toHaveLength(1)
      expect(result.messages[0].message).toBe('Hello, updated')
      expect(result.messages[0].citations).toEqual(updatedMessage.citations)
    })
  })

  describe('setThreadId', () => {
    it('should set the threadId in the state', () => {
      const threadId = 'thread123'
      const result = reducer(initialState, setThreadId(threadId))
      expect(result.threadId).toBe(threadId)
    })
  })

  describe('removeMessages', () => {
    it('should remove all messages from the state', () => {
      const existingState = {
        ...initialState,
        messages: [
          { id: '1', message: 'Hello', role: Roles.user },
          { id: '2', message: 'Hi there', role: Roles.assistant }
        ]
      }

      const result = reducer(existingState, removeMessages())
      expect(result.messages).toHaveLength(0)
    })
  })

  describe('updateFiles', () => {
    it('should update files for the specified message id', () => {
      const existingState = {
        ...initialState,
        messages: [{ id: '1', message: 'Hello', role: Roles.user, files: '' }]
      }

      const updatedFiles = JSON.stringify([
        { name: 'file1.txt', url: 'http://example.com/file1' }
      ])
      const result = reducer(
        existingState,
        updateFiles({ id: '1', files: updatedFiles })
      )

      expect(result.messages).toHaveLength(1)
      expect(result.messages[0].files).toBe(updatedFiles)
    })

    it('should not modify state if the message id is not found', () => {
      const existingState = {
        ...initialState,
        messages: [{ id: '1', message: 'Hello', role: Roles.user, files: '' }]
      }

      const result = reducer(
        existingState,
        updateFiles({ id: '2', files: 'new files' })
      )

      expect(result.messages).toHaveLength(1)
      expect(result.messages[0].files).toBe('')
    })
  })
})
