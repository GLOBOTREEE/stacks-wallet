import { createReducer, createSelector } from '@reduxjs/toolkit';
import log from 'electron-log';

import { RootState } from '..';
import { setPasswordSuccess } from './keys.actions';
import { encryptMnemonic } from 'blockstack';
import {
  persistMnemonicSafe,
  persistMnemonic,
  addData,
  attemptWalletDecryptFailed,
  attemptWalletDecrypt,
} from './keys.actions';

export interface KeysState {
  mnemonic: string | null;
  decrypting: boolean;
  salt?: string;
  decryptionError?: string;
  encryptMnemonic?: string;
}

const initialState: Readonly<KeysState> = Object.freeze({
  mnemonic: null,
  decrypting: false,
});

export const createKeysReducer = (keys: Partial<KeysState> = {}) =>
  createReducer({ ...initialState, ...keys }, builder =>
    builder
      .addCase(persistMnemonicSafe, (state, action) => {
        if (state.mnemonic !== null) {
          log.warn(
            'generateMnemonicSafe failed. Tried to create mnemonic when one already exists.'
          );
          return state;
        }
        return { ...state, mnemonic: action.payload };
      })
      .addCase(persistMnemonic, (state, action) => ({ ...state, mnemonic: action.payload }))
      .addCase(addData, (state, action) => ({ ...state, ...(action.payload as KeysState) }))
      .addCase(setPasswordSuccess, (state, action) => ({ ...state, ...action.payload }))
      .addCase(attemptWalletDecrypt, state => ({ ...state, decrypting: true }))
      .addCase(attemptWalletDecryptFailed, (state, action) => ({
        ...state,
        decrypting: false,
        decryptionError: action.payload.decryptionError,
      }))
  );

export const selectKeysSlice = (state: RootState) => state.keys;

export const selectMnemonic = createSelector(selectKeysSlice, state => state.mnemonic);
