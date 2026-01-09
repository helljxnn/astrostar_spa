import styled from "styled-components";

const InlineLoader = ({ message = "Cargando...", size = "medium" }) => {
  const sizeConfig = {
    small: { loader: 30, before: 45, after: 60 },
    medium: { loader: 50, before: 70, after: 90 },
    large: { loader: 70, before: 95, after: 120 },
  };

  const currentSize = sizeConfig[size] || sizeConfig.medium;

  return (
    <StyledWrapper size={currentSize}>
      <div className="inline-loader-content">
        <div className="loader" />
        {message && <p className="loader-message">{message}</p>}
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .inline-loader-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 20px;
  }

  .loader-message {
    color: #6b7280;
    font-size: 14px;
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
    width: ${(props) => props.size.loader}px;
    height: ${(props) => props.size.loader}px;
    border-color: #5a4ff3 transparent #5a4ff3 transparent;
  }

  .loader::before,
  .loader::after {
    position: absolute;
    content: "";
  }

  .loader::before {
    border-color: #35a2d2 transparent #35a2d2 transparent;
    width: ${(props) => props.size.before}px;
    height: ${(props) => props.size.before}px;
    animation-delay: -0.5s;
    animation-duration: 2s;
  }

  .loader::after {
    border-color: #9c40fc transparent #9c40fc transparent;
    width: ${(props) => props.size.after}px;
    height: ${(props) => props.size.after}px;
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
  .inline-loader-content {
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

export default InlineLoader;
