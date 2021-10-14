import { render } from '@testing-library/react';

import MultiSelectList from './multi-select-list';

describe('MultiSelectList', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<MultiSelectList />);
    expect(baseElement).toBeTruthy();
  });
});
