import React from "react";

const HandleOnChange = (formData , e, nameFunction) => {
  const { name, value } = e.target;
  nameFunction({
    ...formData,
    [name]: value,
  });
};

export default HandleOnChange;
