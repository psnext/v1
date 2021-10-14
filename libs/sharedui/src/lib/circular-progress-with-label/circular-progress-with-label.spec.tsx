import { render } from '@testing-library/react';

import CircularProgressWithLabel from './circular-progress-with-label';

describe('CircularProgressWithLabel', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CircularProgressWithLabel />);
    expect(baseElement).toBeTruthy();
  });
});
