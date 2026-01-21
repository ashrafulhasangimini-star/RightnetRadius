import React, { useState } from 'react'
import { Disclosure } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'
import { Link } from '@inertiajs/react'

export default function UserLayout({ children, user }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/user/dashboard' },
    { name: 'Usage', href: '/user/usage' },
    { name: 'Sessions', href: '/user/sessions' },
    { name: 'Invoices', href: '/user/invoices' },
    { name: 'Profile', href: '/user/profile' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Navbar */}
      <Disclosure as="nav" className="bg-white shadow lg:hidden">
        {({ open }) => (
          <>
            <div className="flex justify-between h-16 px-4">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-blue-600">RightnetRadius</h1>
              </div>
              <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md">
                {open ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </Disclosure.Button>
            </div>
            <Disclosure.Panel className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                >
                  {item.name}
                </Link>
              ))}
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      <div className="flex h-screen bg-gray-100 lg:overflow-hidden">
        {/* Sidebar */}
        <div className="hidden lg:flex lg:flex-col lg:w-64 lg:bg-white lg:shadow">
          <div className="flex items-center h-16 px-4 border-b">
            <h1 className="text-xl font-bold text-blue-600">RightnetRadius</h1>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="border-t p-4">
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">{user.username}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <Link
              href="/logout"
              method="post"
              as="button"
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
              Logout
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
