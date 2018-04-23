package org.t2k.cgs.utils;

import org.apache.commons.httpclient.methods.RequestEntity;

import java.io.FilterOutputStream;
import java.io.IOException;
import java.io.OutputStream;

public class CountingMultipartRequestEntity implements RequestEntity {
    private final RequestEntity delegate;

    private final ProgressListener listener;

    public CountingMultipartRequestEntity(final RequestEntity entity,
                                          final ProgressListener listener) {
        super();
        this.delegate = entity;
        this.listener = listener;
    }

    public long getContentLength() {
        return this.delegate.getContentLength();
    }

    public String getContentType() {
        return this.delegate.getContentType();
    }

    public boolean isRepeatable() {
        return this.delegate.isRepeatable();
    }

    public void writeRequest(final OutputStream out) throws IOException {
        this.delegate.writeRequest(new CountingOutputStream(out, this.listener));
    }

    public static interface ProgressListener {

        void transferred(long num);
    }

    public static class CountingOutputStream extends FilterOutputStream {

        private final ProgressListener listener;

        private long transferred;

        public CountingOutputStream(final OutputStream out,
                                    final ProgressListener listener) {
            super(out);
            this.listener = listener;
            this.transferred = 0;
        }

        public void write(byte[] b, int off, int len) throws IOException {
            out.write(b, off, len);
            this.transferred += len;
            this.listener.transferred(this.transferred);
        }

        public void write(int b) throws IOException {
            out.write(b);
            this.transferred++;
            this.listener.transferred(this.transferred);
        }
    }
}