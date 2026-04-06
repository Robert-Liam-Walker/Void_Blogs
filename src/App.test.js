import { render, screen, waitFor } from "@testing-library/react";
import App from "./App";

test("renders the Void Blogs shell", async () => {
  render(<App />);

  expect(screen.getAllByText(/VOID_BLOGS/i).length).toBeGreaterThan(0);
  expect(screen.getByRole("button", { name: /LIST_ALL/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /NEW_POST/i })).toBeInTheDocument();
  expect(screen.getByText(/API endpoint is not configured/i)).toBeInTheDocument();
  await waitFor(() => {
    expect(screen.getByText(/API_NOT_CONFIGURED/i)).toBeInTheDocument();
  });
});
