import styled from "styled-components";

const Loader = ({ isVisible = false, message = "Cargando..." }) => {
  if (!isVisible) return null;

  return (
    <StyledWrapper>
      <div className="loader-overlay">
        <div className="loader-content">
          <div className="loader" />
          {message && <p className="loader-message">{message}</p>}
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .loader-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 20000;
    pointer-events: all;
  }

  .loader-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .loader-message {
    color: white;
    font-size: 16px;
    font-weight: 500;
    margin: 0;
    text-align: center;
  }

  .loader,
  .loader::before,
  .loader::after {
    border-width: 3px;
    border-style: solid;
    border-radius: 50%;
    animation: rotate 1.5s linear infinite;
  }

  .loader {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    width: 50px;
    height: 50px;
    border-color: #5a4ff3 transparent #5a4ff3 transparent;
  }

  .loader::before,
  .loader::after {
    position: absolute;
    content: "";
  }

  .loader::before {
    border-color: #35a2d2 transparent #35a2d2 transparent;
    width: 70px;
    height: 70px;
    animation-delay: -0.5s;
    animation-duration: 2s;
  }

  .loader::after {
    border-color: #9c40fc transparent #9c40fc transparent;
    width: 90px;
    height: 90px;
    animation-delay: -1s;
    animation-duration: 2.5s;
  }

  @keyframes rotate {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  /* Animación de entrada suave */
  .loader-overlay {
    animation: fadeIn 0.3s ease-in-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

export default Loader;
