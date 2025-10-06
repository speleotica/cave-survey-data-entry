import { Error, Warning } from '@mui/icons-material'
import { TextField, InputAdornment, Tooltip, useForkRef } from '@mui/material'
import React from 'react'

type UseHtmlFieldProps = (index: number) => React.ComponentProps<
  typeof TextField
> & {
  validationError?: React.ReactNode
}

export const SurveyDataTextField = ({
  index,
  x,
  y,
  h = 1,
  useFieldProps,
  sx,
  inputProps,
  InputProps,
  ...props
}: React.ComponentProps<typeof TextField> & {
  index: number
  x: number
  y: number
  h?: number
  useFieldProps?: UseHtmlFieldProps
}) => {
  const { validationError, ...fieldProps } = useFieldProps?.(index) || {}

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      type Ref = [x: number, y: number, h?: number]
      let refs: Ref[] | undefined
      const input =
        event.target instanceof HTMLInputElement ? event.target : undefined
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault()
          refs = [
            [x, y - 1, 1],
            [x, y - 2, 2],
          ]
          break
        case 'ArrowDown':
          event.preventDefault()
          refs = [[x, y + h]]
          break
        case 'ArrowLeft':
          refs =
            h === 2
              ? [
                  [x - 1, y + 1, 1],
                  [x - 1, y - 1, 2],
                  [x - 1, y],
                  [x - 1, y - 1],
                ]
              : [
                  [x - 1, y],
                  [x - 1, y - 1, 2],
                  [x - 1, y - 1],
                ]
          break
        case 'ArrowRight':
          if (input && input.selectionEnd === input.value?.length) {
            refs =
              h === 2
                ? [
                    [x + 1, y],
                    [x + 1, y + 1],
                    [x + 1, y - 1, 2],
                  ]
                : [
                    [x + 1, y],
                    [x + 1, y - 1, 2],
                  ]
          }
          break
      }
      const page = input?.closest(`[data-component="SurveyPageFields"]`)
      let otherInput: HTMLInputElement | undefined
      for (const [x, y, h] of refs || []) {
        const input = page?.querySelector(
          `[data-x="${x}"][data-y="${y}"]${h != null ? `[data-h="${h}"]` : ''}`
        )
        if (input instanceof HTMLInputElement) {
          otherInput = input
          break
        }
      }
      if (otherInput) {
        event.preventDefault()
        otherInput.focus()
        otherInput.select()
      }
    },
    [x, y, h]
  )

  const inputRef = React.useRef<HTMLInputElement>(null)
  const combinedRef = useForkRef(inputRef, InputProps?.inputRef)

  const handleClick = React.useCallback(() => {
    const input = inputRef.current
    if (input != null && document.activeElement !== input) {
      input.focus()
    }
  }, [])

  const handleFocus = React.useCallback(() => {
    inputRef.current?.select()
  }, [])

  return (
    <TextField
      {...fieldProps}
      {...props}
      error={validationError != null}
      onKeyDown={onKeyDown}
      onFocus={handleFocus}
      sx={{
        flexGrow: 1,
        flexShrink: 1,
        // flexBasis: '10%',
        flexBasis: 0,
        backgroundColor: fieldProps?.value
          ? 'rgba(255, 255, 255, 0.8)'
          : 'none',
        '& input': {
          padding: '2px',
          textAlign: 'center',
        },
        ...sx,
      }}
      inputProps={{
        'data-x': x,
        'data-y': y,
        'data-h': h,
        ...inputProps,
      }}
      InputProps={{
        ...InputProps,
        inputRef: combinedRef,
        sx: {
          borderRadius: 0,
          height: '100%',
          fontSize: '0.8rem',
          ...InputProps?.sx,
        },
        endAdornment: validationError ? (
          <InputAdornment
            position="end"
            sx={{
              ml: 0,
              mr: -1.5,
            }}
            onClick={handleClick}
          >
            <Tooltip
              disableInteractive
              title={
                typeof validationError === 'string'
                  ? validationError.replace(/Warning:\s+/, '')
                  : validationError
              }
            >
              {typeof validationError === 'string' &&
              validationError.startsWith('Warning') ? (
                <Warning sx={{ color: 'orange', height: 16, width: 16 }} />
              ) : (
                <Error
                  sx={{
                    color: 'red',
                    height: 16,
                    width: 16,
                  }}
                />
              )}
            </Tooltip>
          </InputAdornment>
        ) : undefined,
      }}
    />
  )
}
