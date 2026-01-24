import React from 'react'
import { render, screen } from '@testing-library/react'
import Home from './Home'

test('renders Home and shows Entities header', () => {
  render(<Home />)
  expect(screen.getByText('Entities')).toBeInTheDocument()
})
