"use client";

import { Button } from "@heroui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = [];
  const showPages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
  let endPage = Math.min(totalPages, startPage + showPages - 1);

  if (endPage - startPage < showPages - 1) {
    startPage = Math.max(1, endPage - showPages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <Button
        isIconOnly
        size="sm"
        variant="flat"
        isDisabled={currentPage === 1}
        onPress={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft size={16} />
      </Button>

      {startPage > 1 && (
        <>
          <Button
            size="sm"
            variant="flat"
            onPress={() => onPageChange(1)}
          >
            1
          </Button>
          {startPage > 2 && <span className="text-default-400">...</span>}
        </>
      )}

      {pages.map((page) => (
        <Button
          key={page}
          size="sm"
          variant={currentPage === page ? "solid" : "flat"}
          color={currentPage === page ? "primary" : "default"}
          onPress={() => onPageChange(page)}
        >
          {page}
        </Button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="text-default-400">...</span>}
          <Button
            size="sm"
            variant="flat"
            onPress={() => onPageChange(totalPages)}
          >
            {totalPages}
          </Button>
        </>
      )}

      <Button
        isIconOnly
        size="sm"
        variant="flat"
        isDisabled={currentPage === totalPages}
        onPress={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight size={16} />
      </Button>
    </div>
  );
}
