function PageMeta({ title, description }) {
  if (!description) {
    return <title>{title} · zubr-fit</title>;
  }

  return (
    <>
      <title>{title} · zubr-fit</title>
      <meta name="description" content={description} />
    </>
  );
}

export default PageMeta;
