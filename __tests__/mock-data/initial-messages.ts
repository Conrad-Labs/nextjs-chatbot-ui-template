import { ChatMessage, Roles } from '@/lib/redux/slice/chat.slice'

export const initialMessages: ChatMessage[] = [
  {
    id: '1',
    message: 'Hello! How can I help you today?',
    role: Roles.assistant
  },
  {
    id: '2',
    message: 'I need help understanding how to implement unit tests in React.',
    role: Roles.user
  },
  {
    id: '3',
    message:
      'Sure! You can use a library like React Testing Library or Jest to write tests for your components.',
    role: Roles.assistant,
    citations: [
      {
        index: 0,
        text: 'React Testing Library documentation',
        file_name: 'react-testing-library-docs.pdf',
        start_index: 10,
        end_index: 50
      }
    ]
  },
  {
    id: '4',
    message: 'Can you give me an example of a basic test?',
    role: Roles.user
  },
  {
    id: '5',
    message:
      'Certainly! Here is an example of testing a button click using React Testing Library.',
    role: Roles.assistant,
    files: 'button-click-test-example.js'
  },
  {
    id: '6',
    message: 'Thank you! This is very helpful.',
    role: Roles.user
  },
  {
    id: '7',
    message: "You're welcome! Let me know if you have any other questions.",
    role: Roles.assistant
  }
]
