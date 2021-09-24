import { act, renderHook } from '@testing-library/react-hooks';
import {useProviderAuth, useAuth, AuthProvider} from './use-auth';

describe('useLoggedinUser', () => {
  it('should render successfully', () => {
    const { result } = renderHook(() => useProviderAuth());

    expect(result.current.user).toBe(null);

    act(() => {
      //result.current.increment();
    });

    // expect(result.current.count).toBe(1);
  });
});
