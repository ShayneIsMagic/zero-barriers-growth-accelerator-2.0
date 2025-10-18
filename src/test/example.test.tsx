import { screen } from '@testing-library/react'
import { vi } from 'vitest';;
import { beforeEach, describe, expect, it } from 'vitest';
import { clearAllMocks, mockUser, renderWithProviders } from './utils/test-helpers';

// Example component to test (you can replace this with your actual components)
function ExampleButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} data-testid="example-button">
      {children}
    </button>
  );
}

describe('Example Test Suite', () => {
  beforeEach(() => {
    clearAllMocks();
  });

  it('should render a button', () => {
    const handleClick = vi.fn();
    renderWithProviders(<ExampleButton onClick={handleClick}>Click me</ExampleButton>);

    const button = screen.getByTestId('example-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Click me');
  });

  it('should call onClick when button is clicked', async () => {
    const handleClick = vi.fn();
    renderWithProviders(<ExampleButton onClick={handleClick}>Click me</ExampleButton>);

    const button = screen.getByTestId('example-button');
    await button.click();

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should have mock user data available', () => {
    expect(mockUser).toEqual({
      id: 'test-user-1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'USER',
    });
  });
});

