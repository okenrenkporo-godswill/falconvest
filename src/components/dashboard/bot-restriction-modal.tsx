"use client";

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";
import { useState } from "react";
import { ShieldAlert } from "lucide-react";

export function BotRestrictionModal({ isActive }: { isActive: boolean }) {
  const [isOpen, setIsOpen] = useState(isActive);
  
  if (!isActive) return null;
  
  return (
    <Modal 
      isOpen={isOpen} 
      onOpenChange={setIsOpen} 
      size="md" 
      backdrop="blur"
      isDismissable={false}
      hideCloseButton={true}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1 items-center pt-6">
              <div className="p-3 bg-danger/10 rounded-full text-danger mb-2">
                <ShieldAlert size={36} />
              </div>
              <h2 className="text-xl font-bold text-danger text-center">Bot Account Restricted</h2>
            </ModalHeader>
            <ModalBody className="text-center py-4">
              <p className="text-default-700 font-semibold text-sm">
                Attention: Please purchase a trading bot plan to continue trading well with bots.
              </p>
              <p className="text-xs text-default-400 mt-2">
                Copy trading and withdrawal services have been temporarily suspended on your account until a trading bot plan is active.
              </p>
            </ModalBody>
            <ModalFooter className="flex justify-center pb-6">
              <Button 
                color="danger" 
                className="font-bold w-full max-w-[200px]"
                onPress={() => setIsOpen(false)}
              >
                I Understand
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
