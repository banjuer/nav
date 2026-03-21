
import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
    panelClassName?: string;
}

export function Modal({ isOpen, onClose, title, children, footer, panelClassName }: ModalProps) {
    return (
        <Transition appear show={isOpen} as={React.Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                {/* 背景遮罩 - 淡入淡出 */}
                <Transition.Child
                    as={React.Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/40" />
                </Transition.Child>

                {/* 弹窗容器 */}
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        {/* 弹窗面板 - 缩放+淡入 */}
                        <Transition.Child
                            as={React.Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 scale-95 translate-y-2"
                            enterTo="opacity-100 scale-100 translate-y-0"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100 scale-100 translate-y-0"
                            leaveTo="opacity-0 scale-95 translate-y-2"
                        >
                            <Dialog.Panel 
                                className={`w-full max-w-md rounded-xl bg-white p-5 shadow-2xl dark:bg-gray-800 transform transition-all will-change-transform ${panelClassName || ''}`}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    {title && (
                                        <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white">
                                            {title}
                                        </Dialog.Title>
                                    )}
                                    <button
                                        onClick={onClose}
                                        className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ml-auto"
                                    >
                                        <XMarkIcon className="h-5 w-5 text-gray-500" />
                                    </button>
                                </div>

                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                    {children}
                                </div>

                                {footer && <div className="mt-5 flex justify-end gap-2">{footer}</div>}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
