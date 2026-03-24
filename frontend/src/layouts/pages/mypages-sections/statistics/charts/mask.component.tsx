export const makeMask = (maskId: string, stripSize: number, maskSize: number) => {
  return (
    <>
      <pattern
        id="pattern-stripe"
        width={stripSize}
        height={stripSize}
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(55)"
      >
        <rect width={maskSize} height={stripSize} transform="translate(0,0)" fill="white"></rect>
      </pattern>
      <mask id={maskId}>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-stripe)" />
      </mask>
    </>
  );
};
