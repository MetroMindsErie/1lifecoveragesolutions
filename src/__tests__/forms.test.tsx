import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AutoQuotePage } from "../pages/quotes/AutoQuotePage";
import { LifeQuotePage } from "../pages/quotes/LifeQuotePage";
import { HomeownersQuotePage } from "../pages/quotes/HomeownersQuotePage";
import { UmbrellaQuotePage } from "../pages/quotes/UmbrellaQuotePage";
import { CommercialBuildingQuotePage } from "../pages/quotes/CommercialBuildingQuotePage";
import { BopQuotePage } from "../pages/quotes/BopQuotePage";
import { PetQuotePage } from "../pages/quotes/PetQuotePage";
import { RentersQuotePage } from "../pages/RentersQuotePage";
import { ContactPage } from "../pages/ContactPage";

describe("Quote and contact forms", () => {
  test("auto quote collects street/city/state/zip", async () => {
    localStorage.setItem("intro-quote-auto-dismissed", "true");
    render(<AutoQuotePage />);

    const nameInput = document.querySelector<HTMLInputElement>('input[name="name"]');
    const emailInput = document.querySelector<HTMLInputElement>('input[name="email"]');
    const phoneInput = document.querySelector<HTMLInputElement>('input[name="phone"]');

    if (!nameInput || !emailInput || !phoneInput) {
      throw new Error("Required auto quote inputs not found");
    }

    fireEvent.change(nameInput, {
      target: { value: "Test User" },
    });
    fireEvent.change(emailInput, {
      target: { value: "test@example.com" },
    });
    fireEvent.change(phoneInput, {
      target: { value: "2165551234" },
    });

    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => {
      expect(screen.getByText("Street address")).toBeInTheDocument();
    });
    expect(screen.getByText("City")).toBeInTheDocument();
    expect(screen.getByText("State")).toBeInTheDocument();
    expect(screen.getByText("ZIP code")).toBeInTheDocument();
  });

  test("life quote collects street/city/state/zip", async () => {
    render(<LifeQuotePage />);

    const nameInput = document.querySelector<HTMLInputElement>('input[name="name"]');
    const dobInput = document.querySelector<HTMLInputElement>('input[name="dob"]');

    if (!nameInput || !dobInput) {
      throw new Error("Required life quote inputs not found");
    }

    fireEvent.change(nameInput, {
      target: { value: "Test User" },
    });
    fireEvent.change(dobInput, {
      target: { value: "1990-01-01" },
    });

    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => {
      expect(screen.getByText("Street address")).toBeInTheDocument();
    });
    expect(screen.getByText("City")).toBeInTheDocument();
    expect(screen.getByText("State")).toBeInTheDocument();
    expect(screen.getByText("ZIP code")).toBeInTheDocument();
  });

  test("homeowners quote renders property address field", () => {
    render(<HomeownersQuotePage />);

    const nameInput = document.querySelector<HTMLInputElement>('input[name="name"]');
    const emailInput = document.querySelector<HTMLInputElement>('input[name="email"]');
    const phoneInput = document.querySelector<HTMLInputElement>('input[name="phone"]');

    if (!nameInput || !emailInput || !phoneInput) {
      throw new Error("Required homeowners inputs not found");
    }

    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(phoneInput, { target: { value: "2165551234" } });

    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    return waitFor(() => {
      expect(screen.getByText("Street address")).toBeInTheDocument();
      expect(screen.getByText("City")).toBeInTheDocument();
      expect(screen.getByText("State")).toBeInTheDocument();
      expect(screen.getByText("ZIP code")).toBeInTheDocument();
    });
  });

  test("umbrella quote renders preferred contact method", () => {
    render(<UmbrellaQuotePage />);

    const nameInput = document.querySelector<HTMLInputElement>('input[name="name"]');
    const emailInput = document.querySelector<HTMLInputElement>('input[name="email"]');
    const phoneInput = document.querySelector<HTMLInputElement>('input[name="phone"]');

    if (!nameInput || !emailInput || !phoneInput) {
      throw new Error("Required umbrella inputs not found");
    }

    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(phoneInput, { target: { value: "2165551234" } });

    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    return waitFor(() => {
      expect(screen.getByText("Street address")).toBeInTheDocument();
      expect(screen.getByText("City")).toBeInTheDocument();
      expect(screen.getByText("State")).toBeInTheDocument();
      expect(screen.getByText("ZIP code")).toBeInTheDocument();
    });
  });

  test("commercial building quote renders property address field", () => {
    render(<CommercialBuildingQuotePage />);

    const nameInput = document.querySelector<HTMLInputElement>('input[name="name"]');
    const phoneInput = document.querySelector<HTMLInputElement>('input[name="phone"]');
    const emailInput = document.querySelector<HTMLInputElement>('input[name="email"]');

    if (!nameInput || !phoneInput || !emailInput) {
      throw new Error("Required commercial building inputs not found");
    }

    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(phoneInput, { target: { value: "2165551234" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    return waitFor(() => {
      expect(screen.getByText("Street address")).toBeInTheDocument();
      expect(screen.getByText("City")).toBeInTheDocument();
      expect(screen.getByText("State")).toBeInTheDocument();
      expect(screen.getByText("ZIP code")).toBeInTheDocument();
    });
  });

  test("bop quote renders business name field", () => {
    render(<BopQuotePage />);

    const businessNameInput = document.querySelector<HTMLInputElement>('input[name="business_name"]');
    const phoneInput = document.querySelector<HTMLInputElement>('input[name="contact_phone"]');
    const emailInput = document.querySelector<HTMLInputElement>('input[name="contact_email"]');

    if (!businessNameInput || !phoneInput || !emailInput) {
      throw new Error("Required BOP inputs not found");
    }

    fireEvent.change(businessNameInput, { target: { value: "Test Business" } });
    fireEvent.change(phoneInput, { target: { value: "2165551234" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    return waitFor(() => {
      expect(screen.getByText("Street address")).toBeInTheDocument();
      expect(screen.getByText("City")).toBeInTheDocument();
      expect(screen.getByText("State")).toBeInTheDocument();
      expect(screen.getByText("ZIP code")).toBeInTheDocument();
    });
  });

  test("pet quote renders name field", () => {
    render(<PetQuotePage />);

    const nameInput = document.querySelector<HTMLInputElement>('input[name="name"]');
    const emailInput = document.querySelector<HTMLInputElement>('input[name="email"]');
    const phoneInput = document.querySelector<HTMLInputElement>('input[name="phone"]');

    if (!nameInput || !emailInput || !phoneInput) {
      throw new Error("Required pet inputs not found");
    }

    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(phoneInput, { target: { value: "2165551234" } });

    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    return waitFor(() => {
      expect(screen.getByText("Street address")).toBeInTheDocument();
      expect(screen.getByText("City")).toBeInTheDocument();
      expect(screen.getByText("State")).toBeInTheDocument();
      expect(screen.getByText("ZIP code")).toBeInTheDocument();
    });
  });

  test("renters quote renders full name field", () => {
    render(<RentersQuotePage />);
    expect(screen.getByText("Full Name")).toBeInTheDocument();
  });

  test("contact page renders first name field", () => {
    render(<ContactPage />);
    expect(screen.getByText("First Name")).toBeInTheDocument();
  });
});
