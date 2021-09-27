import { act, renderHook } from '@testing-library/react-hooks';
import useQuery from './use-query';

describe('useQuery', () => {
  it('should render successfully', () => {
    const { result } = renderHook(() => useQuery());

    expect(result.current.count).toBe(0);

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });
});
