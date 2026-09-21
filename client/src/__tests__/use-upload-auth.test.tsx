import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const requestState = vi.hoisted(() => ({
  authenticatedRequest: vi.fn(),
}));

vi.mock("@/lib/queryClient", () => ({
  authenticatedRequest: requestState.authenticatedRequest,
}));

import { useUpload } from "@/hooks/use-upload";

describe("useUpload authentication boundary", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    requestState.authenticatedRequest.mockReset();
  });

  it("uses authenticated transport for the upload ticket and direct fetch for storage", async () => {
    requestState.authenticatedRequest.mockResolvedValue(
      new Response(
        JSON.stringify({
          uploadURL: "https://storage.example.test/presigned",
          objectPath: "/objects/uploads/offering.pdf",
          metadata: {
            name: "offering.pdf",
            size: 3,
            contentType: "application/pdf",
          },
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    );
    const storageFetch = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 200 }));
    const file = new File(["pdf"], "offering.pdf", {
      type: "application/pdf",
    });
    const { result } = renderHook(() => useUpload());

    let uploadResult: Awaited<ReturnType<typeof result.current.uploadFile>>;
    await act(async () => {
      uploadResult = await result.current.uploadFile(file);
    });

    expect(uploadResult!).toMatchObject({
      objectPath: "/objects/uploads/offering.pdf",
    });
    expect(requestState.authenticatedRequest).toHaveBeenCalledOnce();
    expect(requestState.authenticatedRequest).toHaveBeenCalledWith(
      "/api/uploads/request-url",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect(storageFetch).toHaveBeenCalledOnce();
    expect(storageFetch).toHaveBeenCalledWith(
      "https://storage.example.test/presigned",
      {
        method: "PUT",
        body: file,
        headers: { "Content-Type": "application/pdf" },
      },
    );
    const storageInit = storageFetch.mock.calls[0]?.[1];
    expect(new Headers(storageInit?.headers).has("Authorization")).toBe(false);
  });
});
