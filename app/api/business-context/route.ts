/**
 * Business Context API
 * Retrieve and manage stored business context data
 */

import { NextRequest, NextResponse } from 'next/server'
import { BusinessContextManager } from '@/lib/context/business-context-manager'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const website = searchParams.get('website')

    const contextManager = BusinessContextManager.getInstance()

    if (website) {
      // Get context for specific website
      const context = contextManager.getContext(website)

      if (!context) {
        return NextResponse.json(
          { error: 'No context found for this website' },
          { status: 404 }
        )
      }

      return NextResponse.json(context)
    } else {
      // Get current/most recent context
      const context = contextManager.getCurrentContext()

      if (!context) {
        return NextResponse.json(
          { error: 'No business context available' },
          { status: 404 }
        )
      }

      return NextResponse.json(context)
    }
  } catch (error) {
    console.error('Business context error:', error)

    return NextResponse.json(
      {
        error: 'Failed to retrieve business context',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { website, ...contextData } = body

    if (!website) {
      return NextResponse.json(
        { error: 'Website is required' },
        { status: 400 }
      )
    }

    const contextManager = BusinessContextManager.getInstance()
    const context = contextManager.setContext(website, contextData)

    return NextResponse.json(context)
  } catch (error) {
    console.error('Business context error:', error)

    return NextResponse.json(
      {
        error: 'Failed to save business context',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const website = searchParams.get('website')

    const contextManager = BusinessContextManager.getInstance()

    if (website) {
      contextManager.clearContext(website)
      return NextResponse.json({ message: 'Context cleared for website' })
    } else {
      contextManager.clearAll()
      return NextResponse.json({ message: 'All contexts cleared' })
    }
  } catch (error) {
    console.error('Business context error:', error)

    return NextResponse.json(
      {
        error: 'Failed to clear business context',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
